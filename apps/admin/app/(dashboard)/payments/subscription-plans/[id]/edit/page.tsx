import React from "react";
import { database } from "@/database/config";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SubscriptionPlanEditForm } from "./form";
import { notFound } from "next/navigation";

// Server component - receives planId from params
export default async function Page({ params }: { params: { id: string } }) {
  const planId = parseInt(params.id, 10);

  if (isNaN(planId)) {
    notFound();
  }

  // Fetch the subscription plan with school details
  const plan = await database
    .selectFrom("subscription_plans")
    .innerJoin("school", "school.id", "subscription_plans.school_id")
    .select([
      "subscription_plans.id",
      "subscription_plans.name",
      "subscription_plans.description",
      "subscription_plans.duration_days",
      "subscription_plans.price",
      "subscription_plans.is_active",
      "subscription_plans.commission_amount",
      "school.id as school_id",
      "school.name as school_name",
      "school.bank_paybill_number",
      "school.bank_account_number",
    ])
    .where("subscription_plans.id", "=", planId)
    .executeTakeFirst();

  if (!plan) {
    notFound();
  }

  return (
    <div className="p-6 space-y-4 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/subscriptions/plans",
            label: "Subscription Plans",
          },
          {
            href: `/subscriptions/plans/${planId}`,
            label: "Edit Plan",
          },
        ]}
      />

      <div className="bg-white border-4 rounded-lg shadow relative mx-0 mt-5">
        <div className="flex items-start justify-between p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold">
            Edit School Subscription Plan
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <SubscriptionPlanEditForm plan={plan} />
        </div>
      </div>
    </div>
  );
}
