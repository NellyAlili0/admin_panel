"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

// ... [Keep existing schemas: addZoneSchema, whitelistTagSchema, etc.] ...

// --- HELPER: FETCH SCHOOL AUTH ---
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
    schoolTagId: schoolInfo.terra_tag_id, // This is crucial for filtering
    baseUrl: "https://api.terrasofthq.com",
  };
}

// ... [Keep getAuthToken function] ...

// --- ✅ NEW ACTION: FETCH ZONES (Replaces API Route) ---
export async function fetchZones() {
  try {
    const auth = await getSchoolAuth();
    if (!auth) return [];

    const token = await getAuthToken(auth);
    if (!token) return [];

    // Filter by School Tag ID to fix visibility issue
    let url = `${auth.baseUrl}/api/zone?page=1`;
    if (auth.schoolTagId) {
      url += `&tags[]=${auth.schoolTagId}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Fetch Zones Error:", res.statusText);
      return [];
    }

    const data = await res.json();

    // Handle API response structure
    if (data?.data?.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("Fetch Zones Exception:", error);
    return [];
  }
}

// ... [Keep existing actions: deleteZone, whitelistTag, etc.] ...
// Ensure deleteZone is exported as you requested delete functionality
export async function deleteZone(zoneId: string) {
  try {
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };

    const token = await getAuthToken(auth);
    if (!token) return { success: false, message: "Authentication failed" };

    const res = await fetch(`${auth.baseUrl}/api/zone/${zoneId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return { success: false, message: "Failed to delete zone" };

    revalidatePath("/zones");
    return { success: true, message: "Zone deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
function getAuthToken(auth: {
  email: string;
  password: string;
  schoolTagId: string | null; // This is crucial for filtering
  baseUrl: string;
}) {
  throw new Error("Function not implemented.");
}
