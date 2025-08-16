"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { Notify } from "@repo/handlers/notify";
import { redirect } from "next/navigation";
import { Auth } from "@/Authentication/index";
import { UserMeta } from "@/database/schema";

// add driver
// add driver
const addDriverSchema = zfd.formData({
  name: zfd.text(),
  email: zfd.text(),
  phone_number: zfd.text(),
  password: zfd.text(),
  neighborhood: zfd.text(),
  county: zfd.text(),
});
export async function addDriver(prevState: any, formData: FormData) {
  const data = addDriverSchema.safeParse(formData);
  if (!data.success) {
    return { message: "Invalid data" };
  }
  const { name, email, phone_number, password, neighborhood, county } =
    data.data;
  let auth = new Auth();
  const hash = await auth.hash({ password: password });
  // make sure email does not exist
  let user = await database
    .selectFrom("user")
    .select(["id"])
    .where("email", "=", email)
    .executeTakeFirst();
  if (user) {
    return { message: "Email already exists" };
  }
  await database
    .insertInto("user")
    .values({
      name,
      email,
      phone_number,
      password: hash,
      kind: "Driver",
      provider: "email",
      statusId: 1,
      wallet_balance: 0,
      is_kyc_verified: false,
      meta: {
        neighborhood: neighborhood || "",
        county: county || "",
        payments: {
          kind: "M-Pesa" as any,
          bank: null,
          account_number: null,
          account_name: null,
        },
        notifications: {
          when_bus_leaves: true,
          when_bus_makes_home_drop_off: true,
          when_bus_make_home_pickup: true,
          when_bus_arrives: true,
          when_bus_is_1km_away: true,
          when_bus_is_0_5km_away: true,
        },
      } as UserMeta,
    })
    .executeTakeFirst();
  revalidatePath("/drivers");
  return redirect("/drivers");
}
