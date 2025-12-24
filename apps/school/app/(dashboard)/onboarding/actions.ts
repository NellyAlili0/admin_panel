"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

const addParentSchema = zfd.formData({
  first_name: zfd.text(),
  last_name: zfd.text(),
  email: zfd.text(),
  phone: zfd.text(),
  national_id: zfd.text(),
  dob: zfd.text(),
  gender: zfd.text(),
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
  if (!schoolInfo?.terra_email || !schoolInfo.terra_password) return null;
  return {
    email: schoolInfo.terra_email,
    password: schoolInfo.terra_password,
    tagId: schoolInfo.terra_tag_id,
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
    return null;
  }
}

export async function addParent(prevState: any, formData: FormData) {
  const data = addParentSchema.safeParse(formData);
  if (!data.success) {
    return { success: false, message: "Invalid or missing fields." };
  }
  const { first_name, last_name, email, phone, national_id, dob, gender } =
    data.data;

  const auth = await getSchoolAuth();
  if (!auth) return { success: false, message: "School credentials missing." };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Using proxy for creation
    const res = await fetch(`${baseUrl}/api/smartcards/accounts/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: auth.email,
        password: auth.password,
        body: {
          first_name,
          last_name,
          email,
          phone,
          national_id,
          dob,
          gender,
          group_id: "a4d08acb-8395-413f-ab5d-7d35e111c039",
          tags: auth.tagId ? [auth.tagId] : [],
        },
      }),
    });

    const result = await res.json();
    if (!res.ok) return { success: false, message: result.error || "Failed." };
    revalidatePath("/parents");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ✅ DELETE PARENT
export async function deleteParent(parentId: string) {
  try {
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };
    const token = await getAuthToken(auth);
    if (!token) return { success: false, message: "Auth failed" };

    const res = await fetch(`${auth.baseUrl}/api/accounts/${parentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Delete Parent Failed:", await res.text());
      return { success: false, message: "Failed to delete parent" };
    }

    revalidatePath("/onboarding");
    return { success: true, message: "Parent deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
