"use server";
import { database } from "@/database/config";
import { uploadExcelToS3 } from "@/lib/s3";

export async function uploadExcelAction(prevState: any, formData: FormData) {
  const school_id = formData.get("school_id")?.toString();
  if (!school_id) return { message: "Missing School Id", success: false };
  const schoolId = parseInt(school_id);
  if (isNaN(schoolId)) return { message: "Invalid School Id", success: false };

  const file = formData.get("excel_file") as File;
  if (!file) return { message: "No File was uploaded", success: false };

  const validExtensions = [".xls", ".xlsx", ".csv"];
  if (!validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return {
      message:
        "Invalid file extension. Only .xls, .csv and .xlsx excel files are allowed.",
      success: false,
    };
  }

  // ✅ Check if school exists
  const school = await database
    .selectFrom("school")
    .select(["school.id", "school.name"])
    .where("school.id", "=", schoolId)
    .executeTakeFirst();

  if (!school) {
    return { message: "School not found", success: false };
  }

  // ✅ Upload Excel to S3
  const file_upload_url = await uploadExcelToS3(file);

  if (!file_upload_url) {
    return { message: "File upload to S3 bucket failed", success: false };
  }

  // ✅ Update smart_card_url field in DB
  await database
    .updateTable("school")
    .set({
      smart_card_url: file_upload_url,
    })
    .where("school.id", "=", schoolId)
    .execute();

  console.log("✅ Uploaded:", file_upload_url);

  return {
    success: true,
    message: "File uploaded and smart_card_url updated successfully",
  };
}
