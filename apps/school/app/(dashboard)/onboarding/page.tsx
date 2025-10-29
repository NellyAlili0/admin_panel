import NoData from "@/components/NoData";
import { cookies } from "next/headers";
import { database } from "@/database/config";
import Parents from "./Parents";

export default async function page() {
  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);

  if (!school_id) {
    console.log("No school_id found in cookies");
    return <NoData />;
  }

  const schoolInfo = await database
    .selectFrom("school")
    .select([
      "school.id",
      "school.name",
      "school.terra_email",
      "school.terra_password",
      "school.terra_tag_id",
    ])
    .where("school.id", "=", school_id)
    .executeTakeFirst();

  if (
    !(
      schoolInfo?.terra_email &&
      schoolInfo.terra_password &&
      schoolInfo.terra_tag_id
    )
  ) {
    console.log("Missing Terra credentials: email, password, or tag ID");
    return <NoData />;
  }
  return (
    <Parents
      email={schoolInfo.terra_email}
      password={schoolInfo.terra_password}
      tag={schoolInfo.terra_tag_id}
    />
  );
}
