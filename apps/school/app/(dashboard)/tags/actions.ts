"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

// --- SCHEMAS ---
const tagSchema = zfd.formData({
  name: zfd.text(),
  description: zfd.text().optional(),
  entity: zfd.text(), // 'zone', 'account', 'dependant'
});

const updateTagSchema = zfd.formData({
  id: zfd.text(),
  name: zfd.text(),
  description: zfd.text().optional(),
  entity: zfd.text(),
});

// --- HELPER: AUTHENTICATION ---
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
      "school.terra_tag_id", // ✅ Added: Fetch School Tag ID
    ])
    .where("school.id", "=", school_id)
    .executeTakeFirst();

  if (!schoolInfo?.terra_email || !schoolInfo.terra_password) {
    return null;
  }

  return {
    email: schoolInfo.terra_email,
    password: schoolInfo.terra_password,
    schoolTagId: schoolInfo.terra_tag_id, // ✅ Return School Tag ID
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

// 1. FETCH TAGS (Scoped to School)
export async function fetchTags(entity: string = "dependant") {
  try {
    const auth = await getSchoolAuth();
    if (!auth) return [];

    const token = await getAuthToken(auth);
    if (!token) return [];

    // ✅ Added: &tags[]=${auth.schoolTagId} to filter by school context
    let url = `${auth.baseUrl}/api/tags?page=1&entity=${entity}`;
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

    if (!res.ok) return [];

    const data = await res.json();
    // Handle API pagination structure: { data: { data: [...] } }
    if (data?.data?.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    // Fallback if structure is flat array
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("Fetch tags error:", error);
    return [];
  }
}

// 2. CREATE TAG
export async function addTag(prevState: any, formData: FormData) {
  try {
    const parse = tagSchema.safeParse(formData);
    if (!parse.success) return { success: false, message: "Invalid data" };

    const { name, description, entity } = parse.data;
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };

    const token = await getAuthToken(auth);
    if (!token) return { success: false, message: "Authentication failed" };

    const res = await fetch(`${auth.baseUrl}/api/tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description, entity }),
    });

    if (!res.ok) {
      return { success: false, message: "Failed to create tag" };
    }

    revalidatePath("/tags");
    return { success: true, message: "Tag created successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 3. DELETE TAG
export async function deleteTag(tagId: string) {
  try {
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };

    const token = await getAuthToken(auth);
    if (!token) return { success: false, message: "Authentication failed" };

    const res = await fetch(`${auth.baseUrl}/api/tags/${tagId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { success: false, message: "Failed to delete tag" };

    revalidatePath("/tags");
    return { success: true, message: "Tag deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 4. UPDATE TAG
export async function updateTag(prevState: any, formData: FormData) {
  try {
    const parse = updateTagSchema.safeParse(formData);
    if (!parse.success) return { success: false, message: "Invalid data" };

    const { id, name, description, entity } = parse.data;
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };

    const token = await getAuthToken(auth);
    if (!token) return { success: false, message: "Authentication failed" };

    const res = await fetch(`${auth.baseUrl}/api/tags/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, description, entity }),
    });

    if (!res.ok) return { success: false, message: "Failed to update tag" };

    revalidatePath("/tags");
    return { success: true, message: "Tag updated successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
