import React from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import GenTable from "@/components/tables";
import { cookies } from "next/headers";

async function Records() {
  const cookieStore = await cookies();
  const school_id = cookieStore.get("school_id")?.value;
  const schoolId = Number(school_id);

  // Get parents of students in this school (student-centric approach)
  const parents = await database
    .selectFrom("student")
    .innerJoin("user as parent", "student.parentId", "parent.id")
    .select([
      "parent.id",
      "parent.name",
      "parent.email",
      "parent.phone_number",
      "parent.wallet_balance",
      "parent.is_kyc_verified",
      "parent.created_at",
    ])
    .where("student.schoolId", "=", schoolId)
    .where("parent.kind", "=", "Parent")
    .distinctOn("parent.id") // Ensure unique parents (in case parent has multiple students)
    .execute();

  const totalParents = parents.length;
  console.log(totalParents);

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/records",
            label: "Records",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
          <p className="text-muted-foreground mt-3">
            Total of {totalParents} parents with students in this school
          </p>
        </div>
      </div>

      <GenTable
        title="Parents with Students in This School"
        cols={["id", "name", "email", "phone_number"]}
        data={parents}
        baseLink="/records/"
        uniqueKey="id"
      />
    </div>
  );
}

export default Records;
