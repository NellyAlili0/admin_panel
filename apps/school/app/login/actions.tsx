"use server";

import { Auth } from "@/Authentication/index";
import { redirect } from "next/navigation";
import { database } from "@/database/config";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

const loginSchema = zfd.formData({
  email: zfd.text(z.string().email()),
  password: zfd.text(z.string().min(6)),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(formData);
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten());
    return {
      message: "Invalid Data Submitted",
    };
  }

  const { email, password } = validatedFields.data;
  const auth = new Auth();

  // Query the user table for an School
  const user = await database
    .selectFrom("user")
    .select(["id", "email", "password", "roleId", "kind", "school_id"])
    .where("email", "=", email)
    .where("kind", "=", "School")
    .executeTakeFirst();

  if (!user || !user.password) {
    return {
      message: "Invalid credentials",
    };
  }

  const isPasswordValid = await auth.compare({ password, hash: user.password });
  if (!isPasswordValid) {
    return {
      message: "Invalid credentials",
    };
  }
  if (!user.email) {
    return {
      message: "Invalid credentials",
    };
  }

  const token = auth.encode({
    payload: {
      id: user.id,
      roleId: user.roleId,
      email: user.email,
      kind: "School",
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("token", token);
  cookieStore.set("school_id", String(user.school_id));

  return redirect("/overview");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return redirect("/login");
}
