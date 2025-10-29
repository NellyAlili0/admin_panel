import { database } from "@/database/config";
import NoData from "@/components/NoData";
import { cookies } from "next/headers";
import SingleParent from "./SingleParent";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const parent_id = id;
  const cookieStore = await cookies();
  const school_id = cookieStore.get("school_id")?.value;
  const schoolId = Number(school_id);

  if (!schoolId) {
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
    .where("school.id", "=", schoolId)
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
    <SingleParent
      email={schoolInfo.terra_email}
      password={schoolInfo.terra_password}
      parent_id={parent_id}
    />
  );
}
