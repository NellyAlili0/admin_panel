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
import { Phone, UserIcon, Mail, Calendar, Clock, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { database } from "@/database/config";

// Define interfaces based on database schema
interface ParentInfo {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  kind: "Parent" | "Driver" | "Admin" | null;
  meta: any | null;
  is_kyc_verified: boolean;
  created_at: Date;
  updated_at: Date;
  statusName: string | null;
}

interface Student {
  id: number;
  name: string;
  profile_picture: string | null;
  comments: string | null;
  address: string | null;
  gender: "Male" | "Female";
}

interface Ride {
  id: number;
  passenger: string | null;
  comments: string | null;
  admin_comments: string | null;
  status: "Requested" | "Cancelled" | "Ongoing" | "Pending" | "Completed";
}

interface DailyRide {
  id: number;
  status: "Active" | "Inactive" | "Started" | "Finished";
  passenger: string | null;
  start_time: Date | null;
  end_time: Date | null;
  kind: "Pickup" | "Dropoff";
}

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: Date;
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // ✅ await params
  const parent_id = id;

  // Add validation
  if (!parent_id || isNaN(Number(parent_id))) {
    console.error("Invalid parent_id:", parent_id);
    return <div>Invalid parent ID</div>;
  }

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
    .where("user.kind", "=", "Parent")
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
            href: "/records",
            label: "Records",
          },
          {
            href: `/records/${parent_id}`,
            label: parentInfo.name ?? "Unknown",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent Info</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="lg:col-span-2 shadow-md rounded-2xl border border-gray-200">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              👤 Personal Information
            </CardTitle>
            <CardDescription className="text-gray-500">
              Parent details and contact information
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Phone */}
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                <Phone className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-800 font-medium">
                    {parentInfo.phone_number ?? "Not provided"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                <Mail className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800 font-medium">
                    {parentInfo.email ?? "Not provided"}
                  </p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                <Calendar className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-gray-800 font-medium">
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
          <Tabs defaultValue="students" className="w-full">
            <TabsContent value="students" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Students"
                  cols={["id", "name", "gender", "comments"]}
                  data={students.map((student) => ({
                    ...student,
                    comments: student.comments ?? "None",
                  }))}
                  baseLink="/records/students/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
