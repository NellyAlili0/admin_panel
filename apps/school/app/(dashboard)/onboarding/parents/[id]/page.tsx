import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, UserIcon, Mail, Calendar } from "lucide-react";
import { AddStudentForm } from "./forms";
import { database } from "@/database/config";
import { EditParentForm } from "./forms";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // ✅ await params
  const parent_id = id;

  // Add validation
  if (!parent_id || isNaN(Number(parent_id))) {
    console.error("Invalid parent_id:", parent_id);
    return <div>Invalid parent ID</div>;
  }
  console.log("Fetching data for parent_id:", parent_id);

  // Fetch parent info with status name from StatusTable
  const parentInfo = await database
    .selectFrom("user")
    .leftJoin("status", "status.id", "user.statusId")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number",
      "user.kind",
      "user.meta",
      "user.is_kyc_verified",
      "user.created_at",
      "user.updated_at",
      "status.name as statusName",
    ])
    .where("user.id", "=", Number(parent_id))
    .executeTakeFirst();

  console.log("Query result:", parentInfo);

  if (!parentInfo) {
    return <div>Parent not found</div>;
  }

  // Fetch students
  const students = await database
    .selectFrom("student")
    .select([
      "student.id",
      "student.name",
      "student.profile_picture",
      "student.comments",
      "student.address",
      "student.gender",
    ])
    .where("student.parentId", "=", parentInfo.id)
    .execute();

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/parents",
            label: "Parents",
          },
          {
            href: `/parents/${parent_id}`,
            label: parentInfo.name ?? "Unknown",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight my-4">
            Parent Info
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <AddStudentForm parentId={parentInfo.id.toString()} />
          <EditParentForm parent={parentInfo} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Parent details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <UserIcon className="h-4 w-4" />
                    <span>name</span>
                  </div>
                  <p className="font-medium">{parentInfo.name ?? "Unknown"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo.phone_number ?? "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo.email ?? "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Joined</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo.created_at.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <GenTable
              title="Students"
              cols={["id", "name", "gender", "comments"]}
              data={students.map((student) => ({
                ...student,
                comments: student.comments ?? "None",
              }))}
              baseLink="/parents/students/"
              uniqueKey="id"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
