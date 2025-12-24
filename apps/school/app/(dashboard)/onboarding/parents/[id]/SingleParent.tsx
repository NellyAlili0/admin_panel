"use client";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, UserIcon, Mail, Calendar, Trash2 } from "lucide-react";
import { AddStudentForm } from "./forms";
import { useEffect, useState } from "react";
import GenTable from "../../../SmartCardTable";
import { deleteStudent } from "../[id]/action"; // ✅ Ensure this is imported
import { toast } from "sonner";

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

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const res = await fetch(`${baseUrl}/api/smartcards/accounts/parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, account_id: parent_id }),
        cache: "no-store",
      });

      if (!res.ok) {
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [email, password, parent_id]);

  // ✅ Handle Delete Student
  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const res = await deleteStudent(id);
    if (res.success) {
      toast.success(res.message);
      fetchParentData(); // Refresh list
    } else {
      toast.error(res.message);
    }
  };

  const studentTableData = Array.isArray(students)
    ? students.map((student) => ({
        ...student,
        gender: student.gender || "Not specified",
        date_joined: student.created_at || "Unknown",
        phone: student.phone || "Not provided",
        // ✅ Add Delete Button
        actions: (
          <button
            onClick={() => handleDeleteStudent(student.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete Student"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      }))
    : [];

  // ... [Rest of Component UI] ...

  return (
    <div className="flex flex-col gap-2">
      {/* ... [Breadcrumbs & Parent Header] ... */}
      <Breadcrumbs
        items={[
          { href: "/onboarding", label: "Parents" },
          { href: "#", label: fullname || "Parent" },
        ]}
      />

      {/* ... [Parent Cards] ... */}

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <GenTable
              title="Students"
              cols={["id", "name", "gender", "phone", "date_joined", "actions"]}
              data={studentTableData}
              baseLink=""
              uniqueKey="id"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
