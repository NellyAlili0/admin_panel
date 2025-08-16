"use server";

import { database } from "@/database/config";
import { Notify } from "@repo/handlers/notify";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { z } from "zod";

// Define form schema
const markAsInspectedSchema = zfd.formData({
  plate: zfd.text(z.string().min(1, "Plate is required")),
});

// Define return type for the action
interface ActionResponse {
  message: string;
}

// Define interface for driver query result
interface Driver {
  id: number;
  email: string | null;
}

export async function markAsInspected(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const validatedFields = markAsInspectedSchema.safeParse(formData);
  if (!validatedFields.success) {
    return {
      message: `Invalid data submitted: ${validatedFields.error.issues
        .map((issue) => issue.message)
        .join(", ")}`,
    };
  }

  const { plate } = validatedFields.data;

  try {
    // Update vehicle inspection status
    const updateResult = await database
      .updateTable("vehicle")
      .set({ is_inspected: true })
      .where("registration_number", "=", plate)
      .executeTakeFirst();

    if (Number(updateResult.numUpdatedRows) === 0) {
      return {
        message: "Vehicle not found",
      };
    }

    // Find driver email and ID
    const driver = await database
      .selectFrom("user")
      .leftJoin("vehicle", "user.id", "vehicle.userId")
      .select(["user.id", "user.email"])
      .where("vehicle.registration_number", "=", plate)
      .executeTakeFirst();

    if (driver) {
      // Insert notification
      await database
        .insertInto("notification")
        .values({
          userId: driver.id,
          title: "Vehicle Inspected",
          message: "Your vehicle has been inspected and approved",
          kind: "Personal",
          section: "Profile",
          is_read: false,
        })
        .execute();

      // Send notification if email exists
      if (driver.email) {
        const notify = new Notify();
        await notify.sendSingle({
          title: "Vehicle Inspected",
          message: "Your vehicle has been inspected and approved",
          email: driver.email,
        });
      }
    }

    revalidatePath(`/vehicles/${plate}`);
    return {
      message: "Vehicle marked as inspected successfully",
    };
  } catch (error) {
    return {
      message:
        "Error marking vehicle as inspected: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
