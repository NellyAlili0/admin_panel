import { database } from "@/database/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, MapPin, UserIcon, Plus, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { use } from "react";

// Define interfaces based on database schema
interface SchoolInfo {
  id: number;
  name: string;
  location: string | null;
  meta: {
    administrator_name?: string;
    administrator_phone?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  url: string | null;
}

interface Student {
  id: number;
  name: string;
  profile_picture: string | null;
  gender: "Male" | "Female";
  parent: string | null;
  phone: string | null;
  email: string | null;
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // ✅ await params

  const schoolId = Number(id);

  // Fetch school info
  const schoolInfo = await database
    .selectFrom("school")
    .select([
      "school.id",
      "school.name",
      "school.location",
      "school.meta",
      "school.url",
    ])
    .where("school.id", "=", schoolId)
    .executeTakeFirst();

  if (!schoolInfo) {
    return <div>School not found</div>;
  }

  // Fetch students
  const students = await database
    .selectFrom("student")
    .leftJoin("user", "user.id", "student.parentId")
    .select([
      "student.id",
      "student.name",
      "student.profile_picture",
      "student.gender",
      "user.name as parent",
      "user.phone_number as phone",
      "user.email as email",
    ])
    .where("student.schoolId", "=", schoolId)
    .execute();

  return (
    <div className="flex flex-col gap-2 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/schools",
            label: "Schools",
          },
          {
            href: `/schools/${schoolId}`,
            label: schoolInfo.name,
          },
        ]}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight my-3">
            School Information
          </h2>
          <p className="text-muted-foreground mb-2">
            {schoolInfo.name} ({students.length} students)
          </p>
        </div>
        <Button variant="default" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Import Students
        </Button>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent>
          <section className="flex flex-col md:flex-row gap-6 items-center flex-wrap w-full">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-xl font-medium">{schoolInfo.name}</h3>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <p>
                  School Location:
                  <span className="text-muted-foreground ml-1">
                    {schoolInfo.location ?? "Not provided"}
                  </span>
                </p>
              </div>
            </div>

            {schoolInfo.meta && (
              <div className="flex gap-5">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {schoolInfo.meta.administrator_phone ?? "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {schoolInfo.meta.administrator_name ?? "Not provided"}
                  </span>
                </div>
              </div>
            )}

            <section className="flex gap-6 flex-wrap">
              {schoolInfo.meta?.latitude && schoolInfo.meta?.longitude ? (
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${schoolInfo.meta.latitude},${schoolInfo.meta.longitude}`}
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    View on Google Maps
                  </span>
                </Link>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  No map coordinates available
                </span>
              )}
              {schoolInfo.url && (
                <a
                  href={schoolInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {schoolInfo.url}
                  </span>
                </a>
              )}
            </section>
          </section>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <GenTable
            title="All Students"
            cols={["id", "name", "gender", "parent", "phone", "email"]}
            data={students.map((student) => ({
              ...student,
              parent: student.parent ?? "Unknown",
              phone: student.phone ?? "Not provided",
              email: student.email ?? "Not provided",
            }))}
            baseLink="/parents/students/"
            uniqueKey="id"
          />
        </CardContent>
      </Card>
    </div>
  );
}
