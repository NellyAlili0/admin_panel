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
import {
  Phone,
  MapPin,
  UserIcon,
  Plus,
  Mail,
  Calendar,
  Banknote,
  Clock,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddStudentForm, SendNotificationForm } from "../forms";
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

export default async function Page(props: {
  params: Promise<{ parent_id: string }>;
}) {
  const { parent_id } = await props.params; // ✅ await params
  const parent_email = parent_id.replace("%40", "@");
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

  // Fetch assigned rides
  const assignedRides = await database
    .selectFrom("ride")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "ride.id",
      "student.name as passenger",
      "ride.comments",
      "ride.admin_comments",
      "ride.status",
    ])
    .where("ride.parentId", "=", parentInfo.id)
    .execute();

  // Fetch trip history
  const tripHistory = await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "student.name as passenger",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("ride.parentId", "=", parentInfo.id)
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();

  // Fetch notifications
  const notifications = await database
    .selectFrom("notification")
    .select([
      "notification.id",
      "notification.title",
      "notification.message",
      "notification.created_at",
    ])
    .where("notification.userId", "=", parentInfo.id)
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
          <h1 className="text-2xl font-bold tracking-tight">Parent Info</h1>
        </div>
        <div className="flex gap-2 items-center">
          <SendNotificationForm parentId={parentInfo.id.toString()} />
          <AddStudentForm parentId={parentInfo.id.toString()} />
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
              <div className="flex flex-col items-center gap-3">
                <div className="text-center">
                  <h2 className="text-xl font-bold">
                    {parentInfo.name ?? "Unknown"}
                  </h2>
                </div>
                <Badge
                  variant={
                    parentInfo.is_kyc_verified ? "default" : "destructive"
                  }
                >
                  {parentInfo.is_kyc_verified
                    ? "KYC Verified"
                    : "KYC Not Verified"}
                </Badge>
                <Badge>{parentInfo.statusName ?? "Unknown Status"}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo.phone_number ?? "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo.email ?? "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
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
          <CardTitle>Parent Activity</CardTitle>
          <CardDescription>
            View Students, ride history, and assigned rides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Ride History</span>
              </TabsTrigger>
              <TabsTrigger value="assigned" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Assigned Rides</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Ride History"
                  cols={[
                    "id",
                    "passenger",
                    "status",
                    "start_time",
                    "end_time",
                    "kind",
                  ]}
                  data={tripHistory.map((ride) => ({
                    ...ride,
                    start_time:
                      ride.start_time?.toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }) ?? "Not started",
                    end_time:
                      ride.end_time?.toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }) ?? "Not ended",
                    passenger: ride.passenger ?? "Unknown",
                  }))}
                  baseLink="/rides/trip/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>

            <TabsContent value="assigned" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Assigned Rides"
                  cols={["id", "status", "passenger"]}
                  data={assignedRides.map((ride) => ({
                    ...ride,
                    passenger: ride.passenger ?? "Unknown",
                  }))}
                  baseLink="/rides/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Notifications"
                  cols={["id", "title", "message", "created_at"]}
                  data={notifications.map((notification) => ({
                    ...notification,
                    created_at: notification.created_at.toLocaleString(
                      "en-US",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    ),
                  }))}
                  baseLink={`/parents/${parent_id}`}
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
