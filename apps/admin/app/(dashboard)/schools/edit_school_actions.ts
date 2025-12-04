"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { z } from "zod";

interface ActionResponse {
  message?: string;
  id?: number;
}

const updateSchoolSchema = zfd.formData({
  school_id: zfd.numeric(),
  admin_name: zfd.text(z.string().optional()),
  admin_phone: zfd.text(z.string().optional()),
  terra_email: zfd.text(z.string().optional()),
  terra_password: zfd.text(z.string().optional()),
  location: zfd.text(z.string().optional()),
  bank_paybill_number: zfd.text(z.string().optional()),
  bank_account_number: zfd.text(z.string().optional()),
  commission_amount: zfd.text(z.string().optional()),
  has_commission: zfd.checkbox(),
});

export async function updateCredentials(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const data = updateSchoolSchema.safeParse(formData);

  if (!data.success) {
    console.error("Validation errors:", data.error.flatten());
    return { message: "Invalid data provided" };
  }

  const {
    school_id,
    admin_name,
    admin_phone,
    terra_email,
    terra_password,
    location,
    bank_paybill_number,
    bank_account_number,
    commission_amount,
    has_commission,
  } = data.data;

  const updateData: Record<string, any> = {};

  // Update direct fields
  if (terra_email && terra_email.trim() !== "") {
    updateData.terra_email = terra_email;
  }

  if (terra_password && terra_password.trim() !== "") {
    updateData.terra_password = terra_password;
  }

  if (location && location.trim() !== "") {
    updateData.location = location;
  }

  if (bank_paybill_number && bank_paybill_number.trim() !== "") {
    updateData.bank_paybill_number = bank_paybill_number;
  }

  if (bank_account_number && bank_account_number.trim() !== "") {
    updateData.bank_account_number = bank_account_number;
  }

  if (commission_amount && commission_amount.trim() !== "") {
    const commissionNum = parseFloat(commission_amount);
    if (!isNaN(commissionNum)) {
      updateData.commission_amount = commissionNum;
    }
  }

  // Always update has_commission as it's a boolean
  updateData.has_commission = has_commission;

  // Handle meta updates
  if (admin_name || admin_phone) {
    const existing = await database
      .selectFrom("school")
      .select("meta")
      .where("id", "=", school_id)
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
        .where("id", "=", school_id)
        .execute();
    }

    revalidatePath("/schools");
    revalidatePath(`/schools/${school_id}`);

    return { id: school_id };
  } catch (error) {
    console.error("Error updating school:", error);
    return {
      message:
        "Error updating school: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
