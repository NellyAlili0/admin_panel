import React from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { AddDriverForm } from "./forms";
import { database } from "@/database/config";

async function page() {
  // available drivers
  const allDrivers = await database
    .selectFrom("user")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number as phone",
      "user.wallet_balance as balance",
      "user.is_kyc_verified as verified",
    ])
    .where("user.kind", "=", "Driver")
    .execute();

  const drivers = allDrivers.map((driver) => ({
    ...driver,
    verified: driver.verified ? "Yes" : "No",
  }));

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-5">
      {/* Header Section */}
      <div className="text-center mb-6">
        <Breadcrumbs
          items={[
            {
              href: "/onboarding",
              label: "Onboarding",
            },
          ]}
        />
      </div>

      {/* Forms and tables */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Parents</h1>
          </div>
          <AddDriverForm />
        </div>
        <GenTable
          title="All Drivers"
          cols={["id", "name", "email", "phone", "verified", "balance"]}
          data={drivers}
          baseLink="onboarding/parents/"
          uniqueKey="id"
        />
      </div>
    </section>
  );
}
export default page;
