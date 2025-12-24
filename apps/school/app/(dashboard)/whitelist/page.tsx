import { cookies } from "next/headers";
import { database } from "@/database/config";
import NoData from "@/components/NoData";
import WhitelistClient from "./WhitelistClient";

export default async function Page() {
  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);

  if (!school_id) return <NoData />;

  // Basic check to ensure school exists, though Actions handle the heavy auth
  const schoolInfo = await database
    .selectFrom("school")
    .select(["id"])
    .where("school.id", "=", school_id)
    .executeTakeFirst();

  if (!schoolInfo) {
    return <NoData />;
  }

  return <WhitelistClient />;
}
