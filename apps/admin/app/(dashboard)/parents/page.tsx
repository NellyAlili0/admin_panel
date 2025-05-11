import { Breadcrumbs } from "@/components/breadcrumbs";
import { db } from "@repo/database";
import GenTable from "@/components/tables";
import { CreateParent } from "./forms";

export default async function Page() {
  const parents = await db
    .selectFrom("user")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number",
      "user.created_at",
    ])
    .where("kind", "=", "Parent")
    .execute();
  let totalParents = parents.length;
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/parents",
            label: "Parents",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
          <p className="text-muted-foreground">
            {" "}
            Total of {totalParents} parents{" "}
          </p>
        </div>
        <CreateParent />
      </div>
      <GenTable
        title="All Parents"
        cols={["id", "name", "email", "phone_number"]}
        data={parents}
        baseLink="/parents/"
        uniqueKey="email"
      />
    </div>
  );
}
