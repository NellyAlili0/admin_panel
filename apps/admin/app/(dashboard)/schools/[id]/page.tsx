"use server";
import { database } from "@/database/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Phone,
  MapPin,
  UserIcon,
  Plus,
  Globe,
  Building2,
  CreditCard,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { use } from "react";
import { CreateSchoolCredentials } from "../credentials";
import UploadExcel from "./form";
import { UpdateSchool } from "../edit_school";

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
  const { id } = await props.params;

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
      "school.has_commission",
      "school.bank_account_number",
      "school.bank_paybill_number",
      "school.commission_amount",
      "school.terra_email",
      "school.terra_password",
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

  const data = {
    name: schoolInfo.name,
    phone_number: schoolInfo.meta?.administrator_phone || "",
    school_id: schoolInfo.id,
  };

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
        <section className="flex items-center gap-2 flex-wrap">
          <CreateSchoolCredentials data={data} />
          <UpdateSchool school_id={schoolId} school={schoolInfo} />
        </section>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p className="font-semibold">
                  {schoolInfo.location ?? "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Admin Phone
                </p>
                <p className="font-semibold">
                  {schoolInfo.meta?.administrator_phone ?? "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Admin Name
                </p>
                <p className="font-semibold">
                  {schoolInfo.meta?.administrator_name ?? "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Website
                </p>
                <p className="font-semibold break-all">
                  {schoolInfo.url ? (
                    <a
                      href={schoolInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {schoolInfo.url}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 ">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <section>
                <p className="text-sm font-medium text-muted-foreground">
                  Google Map
                </p>
                <div>
                  {schoolInfo.meta?.latitude && schoolInfo.meta?.longitude ? (
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${schoolInfo.meta.latitude},${schoolInfo.meta.longitude}`}
                      target="_blank"
                      className="flex items-center gap-2 font-semibold text-blue-600 hover:underline"
                    >
                      view on google maps
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      No map coordinates available
                    </span>
                  )}
                </div>
              </section>
            </div>

            {schoolInfo.terra_email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Terra Email
                  </p>
                  <p className="font-semibold break-all">
                    {schoolInfo.terra_email}
                  </p>
                </div>
              </div>
            )}

            {schoolInfo.bank_paybill_number && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bank Paybill Number
                  </p>
                  <p className="font-semibold">
                    {schoolInfo.bank_paybill_number}
                  </p>
                </div>
              </div>
            )}

            {schoolInfo.bank_account_number && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bank Account Number
                  </p>
                  <p className="font-semibold">
                    {schoolInfo.bank_account_number}
                  </p>
                </div>
              </div>
            )}

            {schoolInfo.commission_amount && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-lg">💰</span>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Commission Amount
                  </p>
                  <p className="font-semibold">
                    KSh {schoolInfo.commission_amount.toLocaleString()}
                  </p>
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
            cols={["id", "name", "gender", "phone", "email"]}
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
