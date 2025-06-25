import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { db, sql } from "@repo/database";
import { CreateSchool } from "./forms";

export default async function Page() {
  const schools = await sql`SELECT 
        id,
        name,
        location,
        url,
        (SELECT COUNT(*) FROM student WHERE student.school_id = school.id) as students
    FROM school`.execute(db);
  let totalSchools = schools.rows.length;
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/schools",
            label: "Schools",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schools</h1>
          <p className="text-muted-foreground">
            {" "}
            Total of {totalSchools} schools{" "}
          </p>
        </div>
        <CreateSchool />
      </div>
      <GenTable
        title="All Schools"
        cols={["id", "name", "location", "students", "url"]}
        data={schools.rows}
        baseLink="/schools/"
        uniqueKey="id"
      />
    </div>
  );
}
