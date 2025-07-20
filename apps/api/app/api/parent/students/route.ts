import { Auth } from "@repo/handlers/auth";
import { db } from "@repo/database";
import { z } from "zod";

export async function GET(req: Request) {
  const auth = new Auth();
  const payload = auth.checkApiToken({ req });

  if (!payload) {
    return Response.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const students = await db
    .selectFrom("student")
    .select(["name", "gender", "id"])
    .where("parent_id", "=", payload.id)
    .execute();

  return Response.json(
    {
      status: "success",
      students,
    },
    { status: 200 }
  );
}

const studentSettings = z.object({
  names: z.string(),
  gender: z.enum(["Male", "Female"]),
  address: z.string().optional(),
  profile_picture: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = new Auth();
  const payload = auth.checkApiToken({ req });

  if (!payload) {
    return Response.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const data = await req.json();
  const check = studentSettings.safeParse(data);

  if (!check.success) {
    return Response.json(
      {
        status: "error",
        message: "Invalid data",
      },
      { status: 400 }
    );
  }
  const { names, gender, address, profile_picture } = check.data;
  const student = await db
    .insertInto("student")
    .values({
      name: names,
      gender,
      address,
      parent_id: payload.id,
      profile_picture,
    })
    .returning(["id", "name", "gender"])
    .executeTakeFirst();
  return Response.json(
    {
      status: "success",
      student,
    },
    { status: 200 }
  );
}
