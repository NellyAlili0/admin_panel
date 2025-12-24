"use server";

import { database } from "@/database/config";
import { zfd } from "zod-form-data";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ... [Existing imports and schema] ...

// Helper Auth functions...
async function getSchoolAuth() {
  /* same as previous file */
  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);
  if (!school_id) return null;
  const schoolInfo = await database
    .selectFrom("school")
    .select(["school.terra_email", "school.terra_password"])
    .where("school.id", "=", school_id)
    .executeTakeFirst();
  if (!schoolInfo) return null;
  return {
    email: schoolInfo.terra_email,
    password: schoolInfo.terra_password,
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
  } catch (e) {
    return null;
  }
}

export async function editParent(prevState: any, formData: FormData) {
  // ... [Existing editParent logic] ...
  return { message: "Parent updated successfully", success: true };
}

export async function addStudent(prevState: any, formData: FormData) {
  // ... [Existing addStudent logic] ...
  return { message: "Student created", success: true };
}

// ✅ DELETE STUDENT ACTION
export async function deleteStudent(studentId: string) {
  try {
    const auth = await getSchoolAuth();
    if (!auth) return { success: false, message: "Auth failed" };
    const token = await getAuthToken(auth);
    if (!token) return { success: false, message: "Auth failed" };

    const res = await fetch(`${auth.baseUrl}/api/dependants/${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Delete Student Failed:", await res.text());
      return { success: false, message: "Failed to delete student" };
    }

    revalidatePath("/onboarding/parents/[id]");
    return { success: true, message: "Student deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
