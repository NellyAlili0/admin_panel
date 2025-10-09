import NoData from "@/components/NoData";
import SmartCardComponent from "./SmartCardComponent";
import { cookies } from "next/headers";
import { database } from "@/database/config";

export default async function SmartCardReportsPage() {
  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);

  if (!school_id) return <NoData />;

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
    return <NoData />;
  }
  return (
    <SmartCardComponent
      email={schoolInfo.terra_email}
      password={schoolInfo.terra_password}
      tag={schoolInfo.terra_tag_id}
    />
  );
}
