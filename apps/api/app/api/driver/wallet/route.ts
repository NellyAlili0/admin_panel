import { db } from "@repo/database";
import { Auth } from "@repo/handlers/auth";
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
  const transactions = await db
    .selectFrom("payment")
    .select([
      "amount",
      "kind",
      "transaction_type",
      "comments",
      "transaction_id",
      "created_at",
      "updated_at",
    ])
    .where("user_id", "=", payload.id)
    .execute();
  return Response.json(
    {
      status: "success",
      transactions,
    },
    { status: 200 }
  );
}

const payoutSchema = z.object({
  kind: z.enum(["Bank", "M-Pesa"]),
  bank: z.string().optional(),
  account_name: z.string().optional(),
  account_number: z.string().optional(),
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
  const check = payoutSchema.safeParse(data);
  if (!check.success) {
    return Response.json(
      {
        status: "error",
        message: "Invalid data",
      },
      { status: 400 }
    );
  }
  const { kind, bank, account_name, account_number } = check.data;
  const userMeta = await db
    .selectFrom("user")
    .select(["meta"])
    .where("id", "=", payload.id)
    .executeTakeFirst();
  let meta = {
    ...userMeta?.meta,
    payments: {
      kind: kind,
      bank: bank,
      account_name: account_name,
      account_number: account_number,
    },
  };
  await db
    .updateTable("user")
    .set({
      meta: JSON.stringify(meta),
    })
    .where("id", "=", payload.id)
    .execute();
  return Response.json(
    {
      status: "success",
    },
    { status: 200 }
  );
}
