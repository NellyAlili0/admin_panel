import { Breadcrumbs } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { database } from "@/database/config";
import { Mail, MapPin, Phone, School, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface School {
  id: number;
  name: string;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);

  // Fetch student info with school name
  const student = await database
    .selectFrom("student")
    .leftJoin("school", "school.id", "student.schoolId")
    .select([
      "student.id",
      "student.name",
      "student.gender",
      "student.address",
      "student.comments",
      "student.created_at",
      "student.profile_picture",
      "student.parentId",
      "school.name as school",
      "student.schoolId",
    ])
    .where("student.id", "=", studentId)
    .executeTakeFirst();

  if (!student) {
    return <div>Student not found</div>;
  }

  // Fetch parent info with status name
  const parent = await database
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
    .where("user.id", "=", student.parentId ?? 0)
    .executeTakeFirst();

  if (!parent) {
    return <div>Parent not found</div>;
  }

  // Fetch all schools
  const schools = await database
    .selectFrom("school")
    .select(["id", "name"])
    .execute();

  return (
    <div>
      <Breadcrumbs
        items={[
          {
            href: "/parents",
            label: "Parents",
          },
          {
            href: `/parents/${parent.email?.replace("@", "%40") ?? "#"}`,
            label: parent.name ?? "Unknown",
          },
          {
            href: `/students/${studentId}`,
            label: student.name,
          },
        ]}
      />
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Student Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Student Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Student details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={student.profile_picture ?? undefined}
                      alt={student.name}
                    />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{student.name}</h2>
                    {student.school && (
                      <p className="text-muted-foreground text-sm">
                        {student.school}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{student.gender}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="font-medium">
                      {student.address ?? "Not provided"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <School className="h-4 w-4" />
                    </div>
                    <span className="font-medium">
                      {student.school ?? "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Info */}
          <Card className="shadow-md rounded-2xl border border-gray-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">
                👨‍👩‍👦 Guardian Information
              </CardTitle>
              <CardDescription className="text-gray-500">
                Parent/Guardian contact details
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Guardian Profile */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {parent.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {parent.name ?? "Unknown"}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-gray-800">
                    {parent.phone_number ?? "Not provided"}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-gray-800">
                    {parent.email ?? "Not provided"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
