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

  const notifications = await db
    .selectFrom("notification")
    .select(["title", "message", "kind", "section", "is_read", "created_at"])
    .where("user_id", "=", payload.id)
    .orderBy("id", "desc")
    .limit(50)
    .execute();

  // count unread
  const unread = await db
    .selectFrom("notification")
    .select(["id"])
    .where("user_id", "=", payload.id)
    .where("is_read", "=", false)
    .execute();

  const unreadCount = unread.length;

  await db
    .updateTable("notification")
    .set({
      is_read: true,
    })
    .where("user_id", "=", payload.id)
    .execute();

  const defaultSettings = {
    when_bus_leaves: true,
    when_bus_makes_home_drop_off: true,
    when_bus_make_home_pickup: true,
    when_bus_arrives: true,
    when_bus_is_1km_away: true,
    when_bus_is_0_5km_away: true,
  };

  const user = await db
    .selectFrom("user")
    .select(["id", "meta"])
    .where("id", "=", payload.id)
    .limit(1)
    .executeTakeFirst();

  if (!user) {
    return Response.json(
      {
        status: "error",
        message: "User not found",
      },
      { status: 404 }
    );
  }
  let meta: any = user.meta ?? {};
  const settings = meta.notifications ?? defaultSettings;
  return Response.json(
    {
      status: "success",
      notifications,
      unreadCount,
      settings,
    },
    { status: 200 }
  );
}

const notificationSettings = z.object({
  when_bus_leaves: z.boolean(),
  when_bus_makes_home_drop_off: z.boolean(),
  when_bus_make_home_pickup: z.boolean(),
  when_bus_arrives: z.boolean(),
  when_bus_is_1km_away: z.boolean(),
  when_bus_is_0_5km_away: z.boolean(),
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
  const check = notificationSettings.safeParse(data);
  if (!check.success) {
    return Response.json(
      {
        status: "error",
        message: "Invalid data",
      },
      { status: 400 }
    );
  }

  const {
    when_bus_leaves,
    when_bus_makes_home_drop_off,
    when_bus_make_home_pickup,
    when_bus_arrives,
    when_bus_is_1km_away,
    when_bus_is_0_5km_away,
  } = check.data;

  const user = await db
    .selectFrom("user")
    .select(["id", "meta"])
    .where("id", "=", payload.id)
    .limit(1)
    .executeTakeFirst();

  if (!user) {
    return Response.json(
      {
        status: "error",
        message: "User not found",
      },
      { status: 404 }
    );
  }
  let meta = {
    ...user.meta,
    notifications: {
      when_bus_leaves,
      when_bus_makes_home_drop_off,
      when_bus_make_home_pickup,
      when_bus_arrives,
      when_bus_is_1km_away,
      when_bus_is_0_5km_away,
    },
  };
  const parent = await db
    .updateTable("user")
    .set({
      meta: JSON.stringify(meta),
    })
    .where("id", "=", payload.id)
    .executeTakeFirst();
  return Response.json(
    {
      status: "success",
    },
    { status: 200 }
  );
}
