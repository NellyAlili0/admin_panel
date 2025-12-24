import NoData from "@/components/NoData";
import { cookies } from "next/headers";
import { database } from "@/database/config";
import TagsClient from "./TagsClient";

export default async function Page() {
  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);

  if (!school_id) return <NoData />;

  const schoolInfo = await database
    .selectFrom("school")
    .select([
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
    <TagsClient
      email={schoolInfo.terra_email}
      password={schoolInfo.terra_password}
      schoolTagId={schoolInfo.terra_tag_id}
    />
  );
}
