import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { db } from "@repo/database";
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

export default async function Page({ params }: { params: any }) {
  const { parent_id } = await params;
  let parent_email = parent_id.replace("%40", "@");
  let parentInfo = await db
    .selectFrom("user")
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
      "user.status",
    ])
    .where("user.email", "=", parent_email)
    .where("user.kind", "=", "Parent")
    .executeTakeFirst();
  if (!parentInfo) {
    return <div>Parent not found</div>;
  }
  // get students, rides assigned, trip history
  let students = await db
    .selectFrom("student")
    .select([
      "student.id",
      "student.name",
      "student.profile_picture",
      "student.comments",
      "student.address",
      "student.gender"
    ])
    .where("student.parent_id", "=", parentInfo.id)
    .execute();
  let assignedRides = await db
    .selectFrom("ride")
    .leftJoin("student", "student.id", "ride.student_id")
    .select([
      "ride.id",
      "student.name as passenger",
      "ride.comments",
      "ride.admin_comments",
      "ride.status",
    ])
    .where("ride.parent_id", "=", parentInfo.id)
    .execute();
  let tripHistory = await db
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.ride_id")
    .leftJoin("student", "student.id", "ride.student_id")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "student.name as passenger",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("ride.parent_id", "=", parentInfo.id)
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();

  let notifications = await db
    .selectFrom("notification")
    .select([
      "notification.id",
      "notification.title",
      "notification.message",
      "notification.created_at",
    ])
    .where("notification.user_id", "=", parentInfo.id)
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
            label: parentInfo.name,
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent Info </h1>
        </div>
        <div className="flex gap-2 items-center">
          <SendNotificationForm parent_id={parentInfo.id.toString()} />
          <AddStudentForm parent_id={parentInfo.id.toString()} />
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
                  <h2 className="text-xl font-bold">{parentInfo.name}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">{parentInfo.phone_number}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{parentInfo.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Joined</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo.created_at.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Tabs for Transactions, Ride History, Assigned Rides */}
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
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Students"
                  cols={["id", "name", "gender", "comments"]}
                  data={students}
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
                  data={tripHistory}
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
                  data={assignedRides}
                  baseLink="/rides/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Notifications"
                  cols={["id", "title", "message"]}
                  data={notifications}
                  baseLink={`/parents/${parent_id}`}
                  uniqueKey=""
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
