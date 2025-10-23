import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { database } from "@/database/config";
import { CreateSchool } from "./forms";
import { SchoolSearch } from "./search-bar";

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

  // Normalize data before passing to client
  const normalizedData = schools.map((school) => ({
    ...school,
    location: school.location ?? "Not provided",
    url: school.url ?? "Not provided",
    students: Number(school.students ?? 0), // ✅ convert to number
  }));

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
          <p className="text-muted-foreground my-2">
            Total of {totalSchools} schools
          </p>
        </div>
        <CreateSchool />
      </div>

      {/* Client-side search & table */}
      <SchoolSearch data={normalizedData} />
    </div>
  );
}
