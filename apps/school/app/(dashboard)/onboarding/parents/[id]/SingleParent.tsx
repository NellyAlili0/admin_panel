"use client";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, UserIcon, Mail, Calendar } from "lucide-react";
import { AddStudentForm } from "./forms";
import { useEffect, useState } from "react";
import GenTable from "../../../SmartCardTable";

interface Props {
  email: string;
  password: string;
  parent_id: string;
}

export default function SingleParent({ email, password, parent_id }: Props) {
  const [students, setStudents] = useState<any>([]);
  const [parentInfo, setParentInfo] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fullname, setFullname] = useState<string>("");
  console.log(students);
  const fetchParentData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const res = await fetch(`${baseUrl}/api/smartcards/accounts/parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          account_id: parent_id,
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Error fetching parents:", await res.text());
        setParentInfo({});
        return;
      }

      const data = await res.json();
      setParentInfo(data?.data || {});
      setFullname(
        `${data?.data?.first_name || ""} ${data?.data?.last_name || ""}`
      );
      setStudents(data?.data?.dependants || []);
    } catch (error) {
      console.error("Network error:", error);
      setParentInfo({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [email, password, parent_id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            {
              href: "onboarding/parents",
              label: "Parents",
            },
            {
              href: `onboarding/parents/${parent_id}`,
              label: "Loading...",
            },
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#efb100] border-r-transparent"></div>
            <p className="text-gray-500 text-lg">
              Loading parent and student information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "onboarding/parents",
            label: "Parents",
          },
          {
            href: `onboarding/parents/${parent_id}`,
            label: parentInfo.first_name ?? "Unknown",
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
          {parentInfo.wallets && parentInfo.wallets.length > 0 && (
            <>
              <AddStudentForm
                parent={parent_id}
                wallet_id={parentInfo?.wallets[0]?.id}
                onStudentAdded={fetchParentData}
              />
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="my-1">Personal Information</CardTitle>
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
                  <p className="font-medium">{fullname ?? "Unknown"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo?.phone ?? "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" />
                    <span>National ID</span>
                  </div>
                  <p className="font-medium">
                    {parentInfo?.national_id ?? "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Joined</span>
                  </div>
                  <p className="font-medium">{parentInfo?.created_at}</p>
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
              cols={["id", "name", "gender", "phone", "date_joined"]}
              data={
                Array.isArray(students)
                  ? students.map((student) => ({
                      ...student,
                      gender:
                        student.gender && student.gender.trim() !== ""
                          ? student.gender
                          : "Not specified",
                      date_joined: student.created_at ?? "Unknown",
                      phone:
                        student.phone && student.phone.trim() !== ""
                          ? student.phone
                          : "Not provided",
                    }))
                  : []
              }
              baseLink=""
              uniqueKey=""
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
