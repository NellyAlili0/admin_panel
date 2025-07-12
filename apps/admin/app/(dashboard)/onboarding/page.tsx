import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { db, sql } from "@repo/database";

export default async function Page() {
  const data = await sql`
    SELECT 
      id, 
      parent_name, 
      parent_email, 
      address ,
      created_at
      FROM onboarding
      ORDER BY created_at DESC
  `.execute(db);

  const countResult = await sql<{ count: number }>`
  SELECT COUNT(*) AS count FROM onboarding
`.execute(db);

  console.log(countResult);
  let total = countResult.rows[0].count;
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/onboarding",
            label: "Onboarding",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight my-3">
            Onboarding Data
          </h1>
          <p className="text-muted-foreground"> Total of {total} records </p>
        </div>
      </div>
      <GenTable
        title="All Schools"
        cols={["id", "created_at", "parent_name", "parent_email", "address"]}
        data={data.rows}
        baseLink="/onboarding/"
        uniqueKey="id"
      />
    </div>
  );
}
