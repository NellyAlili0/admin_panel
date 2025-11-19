"use server";

import { zfd } from "zod-form-data";
import { z } from "zod";
import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Define form schema
const createSchoolSchema = zfd.formData(
  z.object({
    name: zfd.text(z.string().min(1, "Name is required")),
    location: zfd.text(z.string().optional()),
    comment: zfd.text(z.string().optional()),
    longitude: zfd.text(
      z
        .string()
        .regex(/^-?\d*\.?\d+$/, "Invalid longitude")
        .transform(Number)
    ),
    latitude: zfd.text(
      z
        .string()
        .regex(/^-?\d*\.?\d+$/, "Invalid latitude")
        .transform(Number)
    ),
    administratorName: zfd.text(
      z.string().min(1, "Administrator name is required")
    ),
    administratorPhone: zfd.text(
      z.string().min(1, "Administrator phone is required")
    ),
  })
);

// Define return type for the action
interface ActionResponse {
  message?: string;
  id?: number;
}

// Slugify function to generate a subdomain
function slugifyForSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function create(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const data = createSchoolSchema.safeParse(formData);
  if (!data.success) {
    return {
      message:
        "Invalid data submitted: " +
        data.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const {
    name,
    location,
    comment,
    longitude,
    latitude,
    administratorName,
    administratorPhone,
  } = data.data;

  // Generate a subdomain slug
  const school_name = name.toLowerCase();
  const slug = slugifyForSubdomain(school_name);
  const url = `https://schools.zidallie.co.ke/${slug}`;

  try {
    const school = await database
      .insertInto("school")
      .values({
        name: school_name,
        location: location ?? null,
        url: url,
        has_commission: false,
        meta: JSON.stringify({
          administrator_name: administratorName,
          administrator_phone: administratorPhone,
          longitude,
          latitude,
        }),
      })
      .returning("id")
      .executeTakeFirst();

    if (!school) {
      return {
        message: "Failed to create school",
      };
    }

    revalidatePath("/schools");
    // server action
    return { id: school.id };
  } catch (error) {
    return {
      message:
        "Error creating school: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
