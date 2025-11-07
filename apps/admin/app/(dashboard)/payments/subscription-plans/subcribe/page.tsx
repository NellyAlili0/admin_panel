import React from "react";
import { database } from "@/database/config"; // your Kysely instance
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SubscriptionPlanForm } from "./form";

// Server component
export default async function Page() {
  // fetch schools (basic fields needed for dropdown + existing bank details)
  const schools = await database
    .selectFrom("school")
    .select(["id", "name", "bank_paybill_number", "bank_account_number"])
    .orderBy("name")
    .execute();

  // pass schools to client form
  return (
    <div className="p-6 space-y-4 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/subscriptions/plans",
            label: "Subscription Plans",
          },
        ]}
      />

      <div className="bg-white border-4 rounded-lg shadow relative mx-0 mt-5">
        <div className="flex items-start justify-between p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold">
            Create School Subscription Plan
          </h3>
        </div>

        {/* Client form receives the server-fetched schools */}
        <div className="p-6 space-y-6">
          <SubscriptionPlanForm schools={schools} />
        </div>
      </div>
    </div>
  );
}
