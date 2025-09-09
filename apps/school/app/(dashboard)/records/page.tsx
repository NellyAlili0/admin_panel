import React from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import GenTable from "@/components/tables";

async function Records() {
  // Fetch all parents from the `user` table
  // const schoolId = 123; // <- the school you want

  // const parents = await database
  //   .selectFrom("user")
  //   .innerJoin("student", "student.parentId", "user.id")
  //   .select([
  //     "user.id",
  //     "user.name",
  //     "user.email",
  //     "user.phone_number",
  //     "user.created_at",
  //   ])
  //   .where("user.kind", "=", "Parent")
  //   .where("student.schoolId", "=", schoolId)
  //   .distinctOn("user.id") // in case a parent has multiple kids in same school
  //   .execute();

  const parents = await database
    .selectFrom("user")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number",
      "user.wallet_balance",
      "user.is_kyc_verified",
      "user.created_at",
    ])
    .where("user.kind", "=", "Parent")
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
          <p className="text-muted-foreground">
            Total of {totalParents} parents
          </p>
        </div>
      </div>

      <GenTable
        title="All Parents"
        cols={["id", "name", "email", "phone_number"]}
        data={parents}
        baseLink="/records/"
        uniqueKey="id"
      />
    </div>
  );
}

export default Records;
