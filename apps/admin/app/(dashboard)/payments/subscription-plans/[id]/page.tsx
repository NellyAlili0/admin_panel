import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { format } from "date-fns";
import Link from "next/link";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

      "subscription_plans.created_at",
      "subscription_plans.updated_at",

      "school.name as school_name",
      "school.bank_paybill_number as school_paybill_number",
      "school.bank_account_number as school_account_number",
    ])
    .where("subscription_plans.id", "=", Number(id))
    .executeTakeFirst();

  if (!plan) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Subscription Plan not found
      </div>
    );
  }

  const createdAt = format(new Date(plan.created_at), "dd/MM/yyyy HH:mm:ss");
  const updatedAt = format(new Date(plan.updated_at), "dd/MM/yyyy HH:mm:ss");

  return (
    <div className="p-6 space-y-8 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/subscriptions/plans",
            label: "Subscription Plans",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Subscription Plan Details
        </h1>
        <Link
          href={`${id}/edit`}
          className="flex bg-gray-800 hover:bg-gray-700 text-white text-base font-medium px-4 py-2.5 outline-none rounded w-max cursor-pointer "
        >
          Edit School Subcription
        </Link>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-3xl font-bold tracking-tight">
              KES {plan.price}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">
              {plan.is_active ? "ACTIVE" : "INACTIVE"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">School</p>
            <p className="font-medium">{plan.school_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Bank Paybill</p>
            <p className="font-medium">{plan.school_paybill_number ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Bank Account Number</p>
            <p className="font-medium">{plan.school_account_number ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{plan.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{plan.description ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Duration (days)</p>
            <p className="font-medium">{plan.duration_days}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Commission Amount</p>
            <p className="font-medium">{plan.commission_amount ?? 0}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">{createdAt}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">{updatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
