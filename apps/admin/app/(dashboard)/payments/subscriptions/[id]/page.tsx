import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { format } from "date-fns";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sub = await database
    .selectFrom("subscriptions")
    .innerJoin("student", "student.id", "subscriptions.student_id")
    .innerJoin(
      "subscription_plans",
      "subscription_plans.id",
      "subscriptions.plan_id"
    )
    .leftJoin("user as parent", "parent.id", "student.parentId")
    .leftJoin("school", "school.id", "student.schoolId")
    .select([
      "subscriptions.id",
      "subscriptions.amount",
      "subscriptions.start_date",
      "subscriptions.expiry_date",
      "subscriptions.status",

      "subscription_plans.name as plan_name",
      "subscription_plans.commission_amount as plan_commission",

      "student.id as student_id",
      "student.name as student_name",

      "parent.name as parent_name",
      "parent.email as parent_email",
      "parent.phone_number as parent_phone",

      "school.id as school_id",
      "school.name as school_name",
    ])
    .where("subscriptions.id", "=", Number(id))
    .executeTakeFirst();

  if (!sub) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Subscription not found
      </div>
    );
  }

  const parentDisplay =
    sub.parent_name && sub.parent_name.trim() !== ""
      ? sub.parent_name
      : sub.parent_email;

  const statusLabel = sub.status === "active" ? "PAID" : "UNPAID";

  const startDate = format(new Date(sub.start_date), "dd/MM/yyyy");
  const expiryDate = format(new Date(sub.expiry_date), "dd/MM/yyyy");

  // Financial calculations
  const totalAmount = sub.amount ?? 0;
  const commission = sub.plan_commission ?? 0;
  const amountToSchool = totalAmount - commission;

  return (
    <div className="p-6 space-y-8 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/subscriptions",
            label: "Subscription Details",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Subscription Details
        </h1>
      </div>

      {/* MAIN CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Amount Paid</p>
            <p className="text-3xl font-bold tracking-tight">
              KES {totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{statusLabel}</p>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">
              Zidallie Paid (Commission)
            </p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              KES {commission.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              Amount Sent to School
            </p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              KES {amountToSchool.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{sub.plan_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Student</p>
            <p className="font-medium">{sub.student_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Parent</p>
            <p className="font-medium">{parentDisplay}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{sub.parent_phone ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">School</p>
            <p className="font-medium">{sub.school_name ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{startDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Expiry Date</p>
            <p className="font-medium">{expiryDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
