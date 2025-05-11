import { db } from "@repo/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, MapPin, UserIcon, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";

export default async function Page({ params }: { params: any }) {
  const { school_id } = await params;

  // school info
  let schoolInfo = await db
    .selectFrom("school")
    .select(["school.id", "school.name", "school.location", "school.meta"])
    .where("school.id", "=", school_id)
    .executeTakeFirst();
  if (!schoolInfo) {
    return <div>School not found</div>;
  }
  // make a list of students
  let students = await db
    .selectFrom("student")
    .leftJoin("user", "user.id", "student.parent_id")
    .select([
      "student.id",
      "student.name",
      "student.profile_picture",
      "student.gender",
      "user.name as parent",
      "user.phone_number as phone",
      "user.email as email",
    ])
    .where("student.school_id", "=", school_id)
    .execute();
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/schools",
            label: "Schools",
          },
          {
            href: `/schools/${school_id}`,
            label: schoolInfo.name,
          },
        ]}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            School Information
          </h2>
          <p className="text-muted-foreground">
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
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-xl font-medium"> {schoolInfo.name} </h3>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-muted-foreground">
                  School Location: {schoolInfo.location}
                </p>
              </div>
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${schoolInfo.meta?.latitude},${schoolInfo.meta?.longitude}`}
                target="_blank"
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>View on Google Maps</span>
              </Link>
            </div>
            {schoolInfo.meta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span> {schoolInfo.meta?.administrator_phone} </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{schoolInfo.meta?.administrator_name}</span>
                </div>
              </div>
            )}
          </div>
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
            data={students}
            baseLink={`/parents/student/`}
            uniqueKey="id"
          />
        </CardContent>
      </Card>
    </div>
  );
}
