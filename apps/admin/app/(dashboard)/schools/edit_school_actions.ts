"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";

interface ActionResponse {
  message?: string;
  id?: number;
}

export async function updateCredentials(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const school_id = formData.get("school_id") as string | null;
  const admin_name = formData.get("admin_name") as string | null;
  const admin_phone = formData.get("admin_phone") as string | null;
  const terra_email = formData.get("terra_email") as string | null;
  const terra_password = formData.get("terra_password") as string | null;

  if (!school_id) {
    return { message: "School Id is required" };
  }

  const updateData: Record<string, string> = {};

  if (terra_email && terra_email.trim() !== "") {
    updateData.terra_email = terra_email;
  }

  if (terra_password && terra_password.trim() !== "") {
    updateData.terra_password = terra_password;
  }

  if (admin_name || admin_phone) {
    const existing = await database
      .selectFrom("school")
      .select("meta")
      .where("id", "=", Number(school_id))
      .executeTakeFirst();

    let meta: Record<string, any> = {};
    if (existing?.meta) {
      try {
        meta =
          typeof existing.meta === "string"
            ? JSON.parse(existing.meta)
            : (existing.meta as Record<string, any>);
      } catch {
        meta = {};
      }
    }

    if (admin_name && admin_name.trim() !== "") {
      meta.administrator_name = admin_name;
    }
    if (admin_phone && admin_phone.trim() !== "") {
      meta.administrator_phone = admin_phone;
    }

    updateData.meta = JSON.stringify(meta);
  }

  try {
    if (Object.keys(updateData).length > 0) {
      await database
        .updateTable("school")
        .set(updateData)
        .where("id", "=", Number(school_id))
        .executeTakeFirst();
    }

    revalidatePath("/schools");
    return { id: Number(school_id) };
  } catch (error) {
    return {
      message:
        "Error creating school: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
