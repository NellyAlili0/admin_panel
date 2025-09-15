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

  console.log(data);

  const countResult = await sql<{ count: number }>`
  SELECT COUNT(*) AS count FROM onboarding
`.execute(db);
  let total = countResult.rows[0].count;

  const formatted_data = data.rows.map((row: any) => ({
    ...row,
    date: new Date(row.created_at).toLocaleDateString(),
  }));
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
        cols={["id", "parent_name", "parent_email", "address", "date"]}
        data={formatted_data}
        baseLink="/onboarding/"
        uniqueKey="id"
      />
    </div>
  );
}
