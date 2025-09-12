import { database } from "@/database/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin, UserIcon, Globe } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const school_id = cookieStore.get("school_id")?.value;
  const schoolId = Number(school_id);

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
        </div>
      </div>
      <Card className="mb-8 shadow-md rounded-2xl border border-gray-200">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🏫 School Information
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* School name */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {schoolInfo.name}
            </h3>
          </div>

          {/* Info rows */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Location */}
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-800">
                  {schoolInfo.location ?? "Not provided"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <Phone className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Administrator Phone</p>
                <p className="text-gray-800">
                  {schoolInfo.meta?.administrator_phone ?? "Not provided"}
                </p>
              </div>
            </div>

            {/* Admin Name */}
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <UserIcon className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Administrator</p>
                <p className="text-gray-800">
                  {schoolInfo.meta?.administrator_name ?? "Not provided"}
                </p>
              </div>
            </div>

            {/* Website */}
            {schoolInfo.url && (
              <a
                href={schoolInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition"
              >
                <Globe className="h-5 w-5 text-indigo-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <p className="text-blue-600 underline break-words">
                    {schoolInfo.url}
                  </p>
                </div>
              </a>
            )}
          </div>

          {/* Google Maps */}
          <div>
            {schoolInfo.meta?.latitude && schoolInfo.meta?.longitude ? (
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${schoolInfo.meta.latitude},${schoolInfo.meta.longitude}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              >
                <MapPin className="h-4 w-4" />
                <span>View on Google Maps</span>
              </Link>
            ) : (
              <span className="text-gray-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                No coordinates available
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
