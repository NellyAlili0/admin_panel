import { db } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Phone,
  MapPin,
  UserIcon,
  Plus,
  Globe,
  Mail,
  VenusAndMars,
  School,
} from "lucide-react";

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  let dataInfo = await db
    .selectFrom("onboarding")
    .innerJoin("school", "school.id", "onboarding.school_id")
    .select([
      "onboarding.parent_name",
      "onboarding.parent_email",
      "onboarding.parent_phone",
      "onboarding.address",
      "onboarding.student_name",
      "onboarding.student_gender",
      "school.name as school_name",
      "onboarding.ride_type",
    ])
    .where("onboarding.id", "=", id)
    .executeTakeFirst();

  if (!dataInfo) {
    return <div>Data not found</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/onboarding",
            label: "Onboarding",
          },
          {
            href: `/onboarding/${id}`,
            label: dataInfo.parent_name,
          },
        ]}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight my-5">
            Parent and Student Information
          </h2>
        </div>
      </div>
      <Card className="mb-8 w-full">
        <CardContent>
          <div className="w-full overflow-hidden">
            {/* Card Content */}
            <div className="p-8">
              {/* Contact Information */}
              <div className="flex flex-wrap gap-20">
                {/* Parent Name */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <UserIcon />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Parent Name
                    </p>
                    <p className="text-gray-700">{dataInfo.parent_name}</p>
                  </div>
                </div>
                {/* Parent Phone */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <Phone />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-700">{dataInfo.parent_phone}</p>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <Mail />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-700">{dataInfo.parent_email}</p>
                  </div>
                </div>
                {/* Address*/}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <MapPin />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-700">{dataInfo.address}</p>
                  </div>
                </div>
                {/* Student Name */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <UserIcon />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Student Name
                    </p>
                    <p className="text-gray-700">{dataInfo.student_name}</p>
                  </div>
                </div>
                {/* Student Gender */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <VenusAndMars />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Student Gender
                    </p>
                    <p className="text-gray-700">{dataInfo.student_gender}</p>
                  </div>
                </div>
                {/* School Name*/}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <School />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">School</p>
                    <p className="text-gray-700">{dataInfo.school_name}</p>
                  </div>
                </div>
                {/* Ride Type */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <Mail />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Ride Type
                    </p>
                    <p className="text-gray-700">{dataInfo.ride_type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
