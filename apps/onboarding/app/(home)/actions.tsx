"use server";

import { db } from "@repo/database";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const formSchema = zfd.formData({
  parent_name: zfd.text(),
  parent_email: zfd.text(z.string().email()),
  parent_phone: zfd.text(),
  address: zfd.text(),
  student_name: zfd.text(z.string().min(1)),
  student_gender: zfd.text(z.enum(["Male", "Female"])),
  ride_type: zfd.text(z.enum(["dropoff", "pickup", "pickup & dropoff"])),
  current_school: zfd.text(),
});

export async function onboard(
  prevState: { message: string },
  formData: FormData
) {
  const data = formSchema.safeParse(formData);

  if (!data.success) {
    return { message: "Invalid data" };
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
  } = data.data;

  const school = await db
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
      school_id: school.id,
    })
    .executeTakeFirst();

  revalidatePath("/");
  return redirect("/success");
}
