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
import StudentZoneManager from "../../students/[id]/StudentZoneManager";
import { getValidToken } from "@/app/api/smartcards/utils/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);

  // 1. Fetch Student from DB
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
      "student.meta",
      "school.name as school",
      "student.schoolId",
    ])
    .where("student.id", "=", studentId)
    .executeTakeFirst();

  if (!student) {
    return <div>Student not found</div>;
  }

  // 2. Fetch Parent from DB
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

  // 3. Fetch Zones & Student Tag from Terra API
  let detailedZones: any[] = [];
  // Try to find the Tag ID in meta. Adjust property name if your DB differs.
  const studentTerraTag =
    (student.meta as any)?.terra_tag_id || (student.meta as any)?.tag_id || "";

  if (student.schoolId) {
    const schoolCreds = await database
      .selectFrom("school")
      .select(["terra_email", "terra_password", "terra_tag_id"])
      .where("id", "=", student.schoolId)
      .executeTakeFirst();

    if (schoolCreds?.terra_email && schoolCreds?.terra_password) {
      try {
        const { token } = await getValidToken(
          schoolCreds.terra_email,
          schoolCreds.terra_password
        );

        // A. Fetch List of Zones filtered by School Tag
        // Note: The list response does NOT contain whitelist info, so we just get IDs here.
        let basicZones: any[] = [];
        if (schoolCreds.terra_tag_id) {
          const zonesRes = await fetch(
            `https://api.terrasofthq.com/api/zone?tags[]=${schoolCreds.terra_tag_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (zonesRes.ok) {
            const data = await zonesRes.json();
            // Handle pagination or flat array structure
            basicZones = Array.isArray(data.data?.data)
              ? data.data.data
              : Array.isArray(data.data)
                ? data.data
                : [];
          }
        }

        // B. Fetch Details for each Zone (to get whitelist_tags)
        // We limit this to avoid performance issues, but for a school with <20 zones it's fine.
        if (basicZones.length > 0) {
          const detailPromises = basicZones.map(async (z: any) => {
            try {
              const singleRes = await fetch(
                `https://api.terrasofthq.com/api/zone/${z.id}/single`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (singleRes.ok) {
                const singleData = await singleRes.json();
                return singleData.data; // This object has 'whitelist_tags'
              }
            } catch (error) {
              console.error(`Failed to fetch details for zone ${z.id}`, error);
            }
            return z; // Fallback to basic zone if detail fetch fails
          });

          detailedZones = (await Promise.all(detailPromises)).filter(Boolean);
        }
      } catch (error) {
        console.error("Failed to fetch zones for student page", error);
      }
    }
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          {
            href: "/records",
            label: "Parents and Students",
          },
          {
            href: `/records/students/${studentId}`,
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
                    <div className="mt-1">
                      {studentTerraTag ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tag ID: {studentTerraTag}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          No Tag Assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Info */}
          <Card className="shadow-md rounded-2xl border border-gray-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {parent?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {parent?.name ?? "Unknown"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-gray-800">
                    {parent?.phone_number ?? "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-800">
                    {parent?.email ?? "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ZONE ACCESS MANAGER SECTION */}
        {studentTerraTag ? (
          <StudentZoneManager
            zones={detailedZones}
            studentTagId={studentTerraTag}
          />
        ) : (
          <Card className="p-8 border-dashed border-2 bg-gray-50 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Zone Access Unavailable
            </h3>
            <p className="text-gray-500 mt-2">
              This student does not have a Smartcard Tag ID associated with
              their account. Please ensure the student is synced with the Terra
              system or update their metadata.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
