"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { Notify } from "@repo/handlers/notify";
import { Auth } from "@/Authentication/index";
import { uploadToS3 } from "@/lib/s3";

const markVerifiedSchema = zfd.formData({
  driver_id: zfd.text(),
});

// mark driver as verified
export async function markVerified(prevState: any, formData: FormData) {
  try {
    const data = markVerifiedSchema.safeParse(formData);
    if (!data.success) {
      return { message: "Invalid driver id", success: false };
    }
    const { driver_id } = data.data;

    await database
      .updateTable("user")
      .set({ is_kyc_verified: true })
      .where("id", "=", Number(driver_id))
      .execute();

    // find driver email and send notification
    const driver = await database
      .selectFrom("user")
      .select(["user.email"])
      .where("user.id", "=", Number(driver_id))
      .executeTakeFirst();

    if (driver) {
      try {
        let notify = new Notify();
        await notify.sendSingle({
          title: "KYC Verified",
          message: "Your KYC has been verified",
          email: driver.email,
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
        // Don't fail the entire operation if notification fails
      }

      revalidatePath("/drivers/" + driver.email);
    }

    return { message: "Driver marked as verified successfully", success: true };
  } catch (error) {
    console.error("Error marking driver as verified:", error);
    return { message: "Failed to mark driver as verified", success: false };
  }
}

// add vehicle
const addVehicleSchema = zfd.formData({
  driver_id: zfd.text(),
  vehicle_name: zfd.text(),
  registration_number: zfd.text(),
  vehicle_type: zfd.text(),
  vehicle_model: zfd.text(),
  vehicle_year: zfd.text(),
  seat_count: zfd.text(),
  is_inspected: zfd.text(),
  comments: zfd.text(),
});

export async function addVehicle(prevState: any, formData: FormData) {
  try {
    const data = addVehicleSchema.safeParse(formData);
    if (!data.success) {
      console.error("Validation errors:", data.error.flatten());
      return { message: "Invalid data provided", success: false };
    }

    let {
      driver_id,
      vehicle_name,
      registration_number,
      vehicle_type,
      vehicle_model,
      vehicle_year,
      seat_count,
      is_inspected,
      comments,
    } = data.data;

    // Remove all spaces from registration number
    registration_number = registration_number.replace(/\s/g, "");

    // Get driver email
    let driver = await database
      .selectFrom("user")
      .select(["user.email"])
      .where("user.id", "=", Number(driver_id))
      .executeTakeFirst();

    if (!driver) {
      return { message: "Driver not found", success: false };
    }

    // Check if vehicle with registration number already exists
    let existingVehicle = await database
      .selectFrom("vehicle")
      .select(["id"])
      .where("registration_number", "=", registration_number)
      .executeTakeFirst();

    if (existingVehicle) {
      return {
        message: "Vehicle with this registration number already exists",
        success: false,
      };
    }

    // Insert new vehicle
    await database
      .insertInto("vehicle")
      .values({
        userId: Number(driver_id),
        vehicle_name: vehicle_name,
        registration_number: registration_number,
        vehicle_type: vehicle_type as any,
        vehicle_model: vehicle_model,
        vehicle_year: Number(vehicle_year),
        seat_count: Number(seat_count),
        available_seats: Number(seat_count),
        is_inspected: is_inspected === "true",
        comments: comments,
        status: "Active" as any,
      })
      .executeTakeFirst();

    // Revalidate the driver page
    revalidatePath("/drivers/" + driver.email);

    // Return success with redirect info instead of using redirect()
    return {
      message: "Vehicle added successfully",
      success: true,
      redirectTo: "/vehicles/" + registration_number,
    };
  } catch (error) {
    console.error("Error adding vehicle:", error);
    return { message: "Failed to add vehicle", success: false };
  }
}

export async function deleteVehicle(prevState: any, formData: FormData) {
  try {
    const data = zfd
      .formData({
        vehicle_id: zfd.text(),
      })
      .safeParse(formData);

    if (!data.success) {
      return { message: "Invalid vehicle id", success: false };
    }

    const { vehicle_id } = data.data;

    await database
      .deleteFrom("vehicle")
      .where("id", "=", Number(vehicle_id))
      .executeTakeFirst();

    return { message: "Vehicle deleted successfully", success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { message: "Failed to delete vehicle", success: false };
  }
}

export async function editDriver(prevState: any, formData: FormData) {
  try {
    const data = zfd
      .formData({
        driver_id: zfd.text(),
        name: zfd.text(),
        email: zfd.text(),
        phone_number: zfd.text(),
        neighborhood: zfd.text(),
        county: zfd.text(),
      })
      .safeParse(formData);

    if (!data.success) {
      return { message: "Invalid data provided", success: false };
    }

    const { driver_id, name, email, phone_number, neighborhood, county } =
      data.data;

    await database
      .updateTable("user")
      .set({
        name: name,
        email: email,
        phone_number: phone_number,
        meta: {
          neighborhood: neighborhood,
          county: county,
        } as any,
      })
      .where("id", "=", Number(driver_id))
      .executeTakeFirst();

    // Revalidate both old and new email paths in case email changed
    revalidatePath("/drivers/" + email);

    return { message: "Driver updated successfully", success: true };
  } catch (error) {
    console.error("Error updating driver:", error);
    return { message: "Failed to update driver", success: false };
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  try {
    const data = zfd
      .formData({
        driver_id: zfd.text(),
        password: zfd.text(),
      })
      .safeParse(formData);

    if (!data.success) {
      return { message: "Invalid data provided", success: false };
    }

    const { driver_id, password } = data.data;

    if (password.length < 6) {
      return {
        message: "Password must be at least 6 characters long",
        success: false,
      };
    }

    let auth = new Auth();
    const hash = await auth.hash({ password: password });

    await database
      .updateTable("user")
      .set({
        password: hash,
      })
      .where("id", "=", Number(driver_id))
      .executeTakeFirst();

    return { message: "Password changed successfully", success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { message: "Failed to change password", success: false };
  }
}

export async function submitKYC(prevState: any, formData: FormData) {
  const driver_id = formData.get("driver_id")?.toString();
  if (!driver_id) return { message: "Missing driver ID" };

  // Fetch the driver's email
  const user = await database
    .selectFrom("user")
    .select(["email"])
    .where("id", "=", Number(driver_id))
    .where("kind", "=", "Driver")
    .executeTakeFirst();

  if (!user || !user.email) {
    return { message: "Driver email not found" };
  }

  // Safely get files
  const national_id_front_file = formData.get(
    "national_id_front"
  ) as File | null;
  const national_id_back_file = formData.get("national_id_back") as File | null;
  const passport_photo_file = formData.get("passport_photo") as File | null;
  const driving_license_file = formData.get("driving_license") as File | null;
  const certificate_of_good_conduct_file = formData.get(
    "certificate_of_good_conduct"
  ) as File | null;

  // Upload files only if available
  const national_id_front =
    national_id_front_file && (await uploadToS3(national_id_front_file));

  const national_id_back =
    national_id_back_file && (await uploadToS3(national_id_back_file));

  const passport_photo =
    passport_photo_file && (await uploadToS3(passport_photo_file));

  const driving_license =
    driving_license_file && (await uploadToS3(driving_license_file));

  const certificate_of_good_conduct =
    certificate_of_good_conduct_file &&
    (await uploadToS3(certificate_of_good_conduct_file));

  // Check at least one document is uploaded
  if (
    !national_id_front ||
    !national_id_back ||
    !passport_photo ||
    !driving_license ||
    !certificate_of_good_conduct
  ) {
    return { message: "No files were uploaded" };
  }

  // Insert into kyc table
  await database
    .insertInto("kyc")
    .values({
      userId: Number(driver_id),
      national_id_front: national_id_front ?? null,
      national_id_back: national_id_back ?? null,
      passport_photo: passport_photo ?? null,
      driving_license: driving_license ?? null,
      certificate_of_good_conduct: certificate_of_good_conduct ?? null,
      comments: null,
      is_verified: false,
    })
    .executeTakeFirst();

  // Insert into notification table
  await database
    .insertInto("notification")
    .values({
      userId: Number(driver_id),
      title: "KYC Requested",
      message:
        "Your KYC request has been submitted. Please wait for approval within 72 hours",
      kind: "System",
      section: "Profile",
      is_read: false,
    })
    .executeTakeFirst();

  // Send email notification
  const notify = new Notify();
  await notify.sendSingle({
    email: user.email,
    title: "KYC Requested",
    message:
      "Your KYC request has been submitted. Please wait for approval within 72 hours",
  });

  return {
    status: "success",
    message: "KYC submitted successfully",
  };
}
