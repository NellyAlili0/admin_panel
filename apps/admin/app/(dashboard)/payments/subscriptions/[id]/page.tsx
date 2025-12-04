import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { format } from "date-fns";
import { EditSubscription } from "./forms";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("Fetching details for subscription ID:", id);

  const sub = await database
    .selectFrom("subscriptions")
    .innerJoin("student", "student.id", "subscriptions.student_id")
    .leftJoin(
      "subscription_plans",
      "subscription_plans.id",
      "subscriptions.plan_id"
    )
    .leftJoin("payment_terms", "payment_terms.id", "subscriptions.term_id")
    .leftJoin("user as parent", "parent.id", "student.parentId")
    .leftJoin("school", "school.id", "student.schoolId")
    .select([
      "subscriptions.id",
      "subscriptions.amount",
      "subscriptions.total_paid",
      "subscriptions.balance",
      "subscriptions.start_date",
      "subscriptions.expiry_date",
      "subscriptions.status",
      "subscriptions.is_commission_paid",
      "subscriptions.days_access",
      "subscriptions.last_payment_date",
      "subscriptions.created_at",

      "subscription_plans.name as plan_name",
      "subscription_plans.commission_amount as plan_commission",
      "subscription_plans.price as plan_price",
      "subscription_plans.duration_days as plan_duration",

      "payment_terms.name as term_name",
      "payment_terms.start_date as term_start",
      "payment_terms.end_date as term_end",

      "student.id as student_id",
      "student.name as student_name",
      "student.account_number as student_account",
      "student.daily_fee",
      "student.transport_term_fee",

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

  const startDate = format(new Date(sub.start_date), "dd/MM/yyyy");
  const expiryDate = format(new Date(sub.expiry_date), "dd/MM/yyyy");
  const createdDate = format(new Date(sub.created_at), "dd/MM/yyyy HH:mm:ss");
  const lastPaymentDate = sub.last_payment_date
    ? format(new Date(sub.last_payment_date), "dd/MM/yyyy HH:mm:ss")
    : "N/A";

  // Financial calculations
  const totalAmount = sub.amount ?? 0;
  const totalPaid = sub.total_paid ?? 0;
  const balance = sub.balance ?? 0;
  const commission = sub.plan_commission ?? 0;
  const amountToSchool = totalPaid - commission;

  // Status determination
  const getStatusDisplay = () => {
    const status = sub.status.toLowerCase();
    if (status === "active") {
      return {
        text: "Active",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    } else if (status === "expired") {
      return { text: "Expired", color: "text-red-600", bgColor: "bg-red-50" };
    } else if (status === "pending") {
      return {
        text: "Pending",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    }
    return { text: status, color: "text-gray-600", bgColor: "bg-gray-50" };
  };

  const statusDisplay = getStatusDisplay();

  // Payment progress percentage
  const paymentProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

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
        <EditSubscription
          subscription={{
            id: sub.id,
            total_paid: sub.total_paid,
            expiry_date: expiryDate,
            student_name: sub.student_name,
          }}
        />
      </div>

      {/* STATUS OVERVIEW CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold tracking-tight">
              KES {totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Status</p>
            <div
              className={`inline-block px-3 py-1 rounded-full ${statusDisplay.bgColor}`}
            >
              <p className={`font-medium ${statusDisplay.color}`}>
                {statusDisplay.text}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(paymentProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              KES {totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm text-orange-700 font-medium">Balance Due</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              KES {balance.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-700 font-medium">
              Commission
              {sub.is_commission_paid && " ✓"}
            </p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              KES {commission.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              Amount to School
            </p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              KES {amountToSchool.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <p className="text-sm text-indigo-700 font-medium">
              Commission Status
            </p>
            <p className="text-lg font-bold text-indigo-900 mt-1">
              {sub.is_commission_paid ? "Paid ✓" : "Unpaid"}
            </p>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION DETAILS CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-4">
          Subscription Information
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Subscription Id</p>
            <p className="font-medium">{sub.id}</p>
          </div>

          {sub.daily_fee && (
            <div>
              <p className="text-sm text-muted-foreground">Daily Fee</p>
              <p className="font-medium">{sub.daily_fee ?? "N/A"}</p>
            </div>
          )}

          {sub.transport_term_fee && (
            <div>
              <p className="text-sm text-muted-foreground">
                Transport Term Fee
              </p>
              <p className="font-medium">{sub.transport_term_fee ?? "N/A"}</p>
            </div>
          )}

          {sub.plan_duration && (
            <div>
              <p className="text-sm text-muted-foreground">Plan Duration</p>
              <p className="font-medium">{sub.plan_duration} days</p>
            </div>
          )}

          {sub.days_access !== null && (
            <div>
              <p className="text-sm text-muted-foreground">Days Access</p>
              <p className="font-medium">{sub.days_access} days</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{startDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Expiry Date</p>
            <p className="font-medium">{expiryDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">{createdDate}</p>
          </div>
          {lastPaymentDate && (
            <div>
              <p className="text-sm text-muted-foreground">Last Payment Date</p>
              <p className="font-medium">{lastPaymentDate}</p>
            </div>
          )}

          {sub.term_name && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Payment Term</p>
                <p className="font-medium">{sub.term_name}</p>
              </div>

              {sub.term_start && sub.term_end && (
                <div>
                  <p className="text-sm text-muted-foreground">Term Period</p>
                  <p className="font-medium">
                    {format(new Date(sub.term_start), "dd/MM/yyyy")} -{" "}
                    {format(new Date(sub.term_end), "dd/MM/yyyy")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* STUDENT & PARENT DETAILS CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-4">
          Student & Parent Information
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Student Name</p>
            <p className="font-medium">{sub.student_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Parent Name</p>
            <p className="font-medium">{parentDisplay ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Parent Phone</p>
            <p className="font-medium">{sub.parent_phone ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Parent Email</p>
            <p className="font-medium">{sub.parent_email ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">School</p>
            <p className="font-medium">{sub.school_name ?? "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
