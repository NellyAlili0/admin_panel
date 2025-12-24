"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

// --- SCHEMAS ---
const addWhitelistSchema = zfd.formData({
  zone_id: zfd.text(),
  entity: zfd.text(), // 'account' or 'dependant'
  tag_uuid: zfd.text(),
});

const removeWhitelistSchema = zfd.formData({
  zone_id: zfd.text(),
  tag_uuid: zfd.text(),
});

// --- HELPER: AUTH ---
async function getSchoolAuth() {
  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);

  if (!school_id) return null;

  const schoolInfo = await database
    .selectFrom("school")
    .select([
      "school.terra_email",
      "school.terra_password",
      "school.terra_tag_id",
    ])
    .where("school.id", "=", school_id)
    .executeTakeFirst();

  if (!schoolInfo?.terra_email || !schoolInfo.terra_password) {
    return null;
  }

  return {
    email: schoolInfo.terra_email,
    password: schoolInfo.terra_password,
    schoolTagId: schoolInfo.terra_tag_id,
    baseUrl: "https://api.terrasofthq.com",
  };
}

async function getAuthToken(auth: any) {
  try {
    const res = await fetch(`${auth.baseUrl}/api/auth/access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: auth.email, password: auth.password }),
    });
    const data = await res.json();
    return data.data?.access_token;
  } catch (error) {
    console.error("Auth Token Error:", error);
    return null;
  }
}

// --- ACTIONS ---

// 1. FETCH ALL WHITELIST RULES (Table Data)
export async function fetchAllWhitelists() {
  try {
    const auth = await getSchoolAuth();
    if (!auth) return [];
    const token = await getAuthToken(auth);
    if (!token) return [];

    // A. Fetch All Zones first
    let zonesUrl = `${auth.baseUrl}/api/zone`;
    if (auth.schoolTagId) {
      zonesUrl += `?tags[]=${auth.schoolTagId}`;
    }

    const zonesRes = await fetch(zonesUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!zonesRes.ok) return [];

    const zonesData = await zonesRes.json();
    const zones = Array.isArray(zonesData.data?.data)
      ? zonesData.data.data
      : Array.isArray(zonesData.data)
        ? zonesData.data
        : [];

    if (zones.length === 0) return [];

    // B. Fetch Details for EACH zone to get 'whitelist_tags'
    // We map each zone to a promise that returns an array of rules (or empty array)
    const rulesPromises = zones.map(async (zone: any) => {
      try {
        const detailRes = await fetch(
          `${auth.baseUrl}/api/zone/${zone.id}/single`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (!detailRes.ok) return [];

        const detailData = await detailRes.json();
        const data = detailData.data || {};

        // Combine all possible fields where whitelist data might be hidden
        const whitelistRaw = [
          ...(data.whitelist_tags || []),
          ...(data.whitelisted_tags || []),
          ...(data.whitelisted_dependant_tags || []),
          ...(data.whitelisted_account_tags || []),
        ];

        // Deduplicate tags (using ID as key)
        const uniqueTags = new Map();
        whitelistRaw.forEach((tag: any) => {
          if (tag && tag.id && !uniqueTags.has(tag.id)) {
            uniqueTags.set(tag.id, tag);
          }
        });

        // Convert to Table Row Format
        return Array.from(uniqueTags.values()).map((tag: any) => ({
          id: `${zone.id}-${tag.id}`, // Unique ID for table row
          zone_id: zone.id,
          zone_name: zone.name,
          tag_id: tag.id,
          tag_name: tag.name,
          entity: tag.entity || "Unknown",
          description: tag.description,
        }));
      } catch (e) {
        console.error(`Failed to fetch details for zone ${zone.id}`, e);
        return [];
      }
    });

    // Resolve all promises and flatten the array of arrays into a single list
    const results = await Promise.all(rulesPromises);
    const flattenedRules = results.flat();

    return flattenedRules;
  } catch (error) {
    console.error("Error fetching whitelists:", error);
    return [];
  }
}

// 2. FETCH HELPERS (For Dropdowns)
export async function fetchZones() {
  const auth = await getSchoolAuth();
  if (!auth) return [];
  const token = await getAuthToken(auth);
  if (!token) return [];

  let url = `${auth.baseUrl}/api/zone`;
  if (auth.schoolTagId) url += `?tags[]=${auth.schoolTagId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return Array.isArray(data.data?.data)
    ? data.data.data
    : Array.isArray(data.data)
      ? data.data
      : [];
}

export async function fetchTags(entity: string) {
  const auth = await getSchoolAuth();
  if (!auth) return [];
  const token = await getAuthToken(auth);
  if (!token) return [];

  const res = await fetch(`${auth.baseUrl}/api/tags?page=1&entity=${entity}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (data?.data?.data && Array.isArray(data.data.data)) return data.data.data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

// 3. ADD TO WHITELIST
export async function addToWhitelist(prevState: any, formData: FormData) {
  try {
    const parse = addWhitelistSchema.safeParse(formData);
    if (!parse.success) return { success: false, message: "Invalid data" };

    const { zone_id, entity, tag_uuid } = parse.data;
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };
    const token = await getAuthToken(auth);

    // Try Standard API first
    let res = await fetch(`${auth.baseUrl}/api/zone/${zone_id}/whitelist-tag`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ entity, tags: [tag_uuid] }),
    });

    // If Standard fails, try Proxy/Smartcard Endpoint
    if (!res.ok) {
      res = await fetch(
        `${auth.baseUrl}/api/smartcards/zone/${zone_id}/whitelist-tag`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: auth.email,
            password: auth.password,
            body: { entity, tags: [tag_uuid] },
          }),
        }
      );
    }

    if (!res.ok) {
      const err = await res.text();
      console.error("Whitelist Add Error:", err);
      return {
        success: false,
        message: "Failed to whitelist tag. Check console.",
      };
    }

    revalidatePath("/whitelist");
    return { success: true, message: "Access rule added successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 4. REMOVE FROM WHITELIST
export async function removeFromWhitelist(prevState: any, formData: FormData) {
  try {
    const parse = removeWhitelistSchema.safeParse(formData);
    if (!parse.success) return { success: false, message: "Invalid data" };

    const { zone_id, tag_uuid } = parse.data;
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };
    const token = await getAuthToken(auth);

    const res = await fetch(
      `${auth.baseUrl}/api/zone/${zone_id}/remove-tag-whitelist`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tag_id: tag_uuid }),
      }
    );

    if (!res.ok) {
      console.error("Remove Whitelist Error:", await res.text());
      return { success: false, message: "Failed to remove rule" };
    }

    revalidatePath("/whitelist");
    return { success: true, message: "Access rule removed successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
