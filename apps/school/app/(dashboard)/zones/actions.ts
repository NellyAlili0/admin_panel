"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

const calculateExpiryDate = () => {
  // Calculate expiry date (3 months from now)
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  const formattedExpiryDate = expiryDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  return formattedExpiryDate;
};

// Add zone schema
const addZoneSchema = zfd.formData({
  name: zfd.text(),
  note: zfd.text().optional(),
});

export async function addZone(prevState: any, formData: FormData) {
  try {
    // Validate form data
    const data = addZoneSchema.safeParse(formData);
    if (!data.success) {
      return {
        success: false,
        message: "Invalid form data. Please check your inputs.",
      };
    }

    const { name, note } = data.data;

    // Get school ID from cookies
    const cookieStore = await cookies();
    const id = cookieStore.get("school_id")?.value;
    const school_id = Number(id);

    if (!school_id) {
      return {
        success: false,
        message: "School ID not found. Please log in again.",
      };
    }

    // Fetch school info
    const schoolInfo = await database
      .selectFrom("school")
      .select([
        "school.id",
        "school.name",
        "school.terra_email",
        "school.terra_password",
        "school.terra_tag_id",
      ])
      .where("school.id", "=", school_id)
      .executeTakeFirst();

    if (!schoolInfo) {
      return {
        success: false,
        message: "School information not found.",
      };
    }

    if (
      !schoolInfo.terra_email ||
      !schoolInfo.terra_password ||
      !schoolInfo.terra_tag_id
    ) {
      return {
        success: false,
        message: "Terra credentials are missing. Please contact support.",
      };
    }

    // Create zone via API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

    const res = await fetch(`${baseUrl}/api/smartcards/zone/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: schoolInfo.terra_email,
        password: schoolInfo.terra_password,
        tags: ["084b14ea-fdc0-4535-833c-70c2bc43ec52"],
        body: {
          name,
          note: note || "",
          status: "Active",
          expiry_date: calculateExpiryDate(),
        },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Zone creation failed:", result);
      return {
        success: false,
        message:
          result.error ||
          result.message ||
          "Failed to create zone. Please try again.",
      };
    }

    // Revalidate the zones path
    revalidatePath("/zones");

    return {
      success: true,
      message: "Zone created successfully!",
    };
  } catch (error: any) {
    console.error("Error creating zone:", error);
    return {
      success: false,
      message:
        error.message || "An unexpected error occurred. Please try again.",
    };
  }
}
