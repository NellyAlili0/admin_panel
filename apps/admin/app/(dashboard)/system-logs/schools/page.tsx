import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { database } from "@/database/config";

// Define interface for school data
interface School {
  id: number;
  name: string;
  location: string | null;
  url: string | null;
  students: number;
}

export default async function Page() {
  // Fetch schools with student count
  const schools = await database
    .selectFrom("school")
    .select([
      "school.id",
      "school.name",
      "school.location",
      "school.url",
      (eb) =>
        eb
          .selectFrom("student")
          .select((eb) => eb.fn.countAll().as("count"))
          .whereRef("student.schoolId", "=", "school.id")
          .as("students"),
    ])
    .execute();

  const totalSchools = schools.length;

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
          <h1 className="text-2xl mt-7 mb-3 font-bold tracking-tight">
            Schools
          </h1>
        </div>
      </div>
      <GenTable
        title="All Schools"
        cols={["name", "location", "students"]}
        data={schools.map((school) => ({
          ...school,
          location: school.location ?? "Not provided",
        }))}
        baseLink="/system-logs/schools/"
        uniqueKey="id"
      />
    </div>
  );
}
