import { Auth } from "@repo/handlers/auth";
import { db } from "@repo/database";

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
  const driver = await db
    .selectFrom("user")
    .select([
      "name",
      "email",
      "phone_number",
      "meta",
      "kind",
      "created_at",
      "wallet_balance",
      "updated_at",
      "status",
    ])
    .where("id", "=", payload.id)
    .where("kind", "=", payload.kind)
    .executeTakeFirst();
  if (!driver) {
    return Response.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
  return Response.json(
    {
      status: "success",
      message: "User found",
      driver,
    },
    { status: 200 }
  );
}
