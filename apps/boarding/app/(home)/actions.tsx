"use server";

import { db } from "@repo/database";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { database } from "../../database/config";

const formSchema = zfd.formData({
  parent_name: zfd.text(),
  parent_email: zfd.text(z.string().email()),
  parent_phone: zfd.text(),
  address: zfd.text(),
  student_name: zfd.text(z.string().min(1)),
  student_gender: zfd.text(z.enum(["Male", "Female"])),
  ride_type: zfd.text(z.enum(["dropoff", "pickup", "pickup & dropoff"])),
  current_school: zfd.text(),
  pickup: zfd.text().optional(),
  dropoff: zfd.text().optional(),
  start_date: zfd.text(),
  mid_term: zfd.text(z.string().optional()),
  end_date: zfd.text(),
});

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function onboard(
  prevState: { message: string },
  formData: FormData
) {
  const data = formSchema.safeParse(formData);

  if (!data.success) {
    const errorMap = data.error.flatten().fieldErrors;
    console.log(errorMap);
    return {
      message:
        "Some fields are missing or incorrect. Please double-check your input and try again.",
    };
  }

  console.log(data);

  const {
    parent_name,
    parent_email,
    parent_phone,
    address,
    student_name,
    student_gender,
    current_school,
    ride_type,
    pickup,
    dropoff,
    start_date,
    mid_term,
    end_date,
  } = data.data;

  const school = await database
    .selectFrom("school")
    .select(["id", "name"])
    .where("name", "=", current_school)
    .executeTakeFirst();

  console.log(current_school);
  console.log(school);

  if (!school) {
    return redirect(
      "/?error=School%20not%20found,%20please%20type%20your%20current%20school"
    );
  }

  await db
    .insertInto("onboarding")
    .values({
      parent_name,
      parent_email,
      parent_phone,
      address,
      student_name,
      student_gender,
      ride_type,
      pickup,
      dropoff,
      start_date,
      mid_term,
      end_date,
      school_id: school.id,
      created_at: getTodayDate(),
    })
    .executeTakeFirst();

  revalidatePath("/");
  return redirect("/success");
}
