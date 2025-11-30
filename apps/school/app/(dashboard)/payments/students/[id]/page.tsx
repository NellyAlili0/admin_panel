import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { format } from "date-fns";

const formatTransCompletedTime = (rawResult: any) => {
  if (!rawResult) return "N/A";

  try {
    const parsedResult =
      typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;

    if (parsedResult?.ResultParameters?.ResultParameter) {
      const params = parsedResult.ResultParameters.ResultParameter;
      const transTimeParam = params.find(
        (p: any) => p.Key === "TransCompletedTime"
      );

      if (transTimeParam?.Value) {
        const value = transTimeParam.Value;
        const year = value.substring(0, 4);
        const month = value.substring(4, 6);
        const day = value.substring(6, 8);
        const hour = value.substring(8, 10);
        const minute = value.substring(10, 12);
        const second = value.substring(12, 14);

        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
      }
    }
  } catch (error) {
    console.error("Error parsing raw_result:", error);
  }
  return "N/A";
};

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paymentId = parseInt(id, 10);

  if (isNaN(paymentId)) {
    return (
      <div className="p-6 text-red-600 font-semibold">Invalid payment ID</div>
    );
  }

  const payment = await database
    .selectFrom("student_payments")
    .innerJoin("student", "student.id", "student_payments.studentId")
    .leftJoin("user as parent", "parent.id", "student.parentId")
    .leftJoin("school", "school.id", "student.schoolId")
    .leftJoin(
      "school_disbursements",
      "school_disbursements.paymentId",
      "student_payments.id"
    )
    .leftJoin(
      "b2cmpesa_transactions",
      "b2cmpesa_transactions.conversation_id",
      "school_disbursements.transaction_id"
    )
    .leftJoin("payment_terms", "payment_terms.id", "student_payments.termId")
    .leftJoin("subscriptions", (join) =>
      join.onRef("subscriptions.student_id", "=", "student.id")
    )
    .select([
      // Payment fields
      "student_payments.id",
      "student_payments.amount_paid",
      "student_payments.transaction_id",
      "student_payments.phone_number",
      "student_payments.payment_type",
      "student_payments.created_at",

      // Student fields
      "student.name as student_name",
      "student.id as student_id",
      "student.account_number as student_account",
      "student.gender",
      "student.address",
      "student.service_type",

      // Parent fields
      "parent.name as parent_name",
      "parent.email as parent_email",
      "parent.phone_number as parent_phone",

      // School fields
      "school.name as school_name",
      "school.id as school_id",

      // Disbursement fields
      "school_disbursements.amount_disbursed as paid_to_school",
      "school_disbursements.bank_paybill",
      "school_disbursements.account_number",
      "school_disbursements.disbursement_type",
      "school_disbursements.status as disbursement_status",

      // Term fields
      "payment_terms.name as term_name",
      "payment_terms.start_date as term_start",
      "payment_terms.end_date as term_end",

      // Transaction fields
      "b2cmpesa_transactions.raw_result",

      // Subscription fields
      "subscriptions.start_date as subscription_start_date",
      "subscriptions.expiry_date as subscription_expiry_date",
      "subscriptions.status as subscription_status",
      "subscriptions.total_paid as subscription_total_paid",
      "subscriptions.balance as subscription_balance",
      "subscriptions.is_commission_paid",
      "subscriptions.days_access",
      "subscriptions.last_payment_date",
    ])
    .where("student_payments.id", "=", paymentId)
    .executeTakeFirst();

  if (!payment) {
    return (
      <div className="p-6 text-red-600 font-semibold">Payment not found</div>
    );
  }

  // Debug: Log subscription data
  console.log("Subscription data:", {
    start_date: payment.subscription_start_date,
    expiry_date: payment.subscription_expiry_date,
    status: payment.subscription_status,
    student_id: payment.student_id,
  });

  const getParentName = () => {
    if (payment.parent_name && payment.parent_name.trim() !== "") {
      return payment.parent_name;
    }
    if (payment.parent_email) {
      return payment.parent_email.split("@")[0];
    }
    return "N/A";
  };

  const parentDisplay = getParentName();
  const paymentDate = formatTransCompletedTime(payment.raw_result);
  const createdDate = format(
    new Date(payment.created_at),
    "dd/MM/yyyy HH:mm:ss"
  );

  const amountPaid = Number(payment.amount_paid ?? 0);
  const paidToSchool = Number(payment.paid_to_school ?? 0);
  const commission = amountPaid - paidToSchool;

  const getSubscriptionStatus = () => {
    if (!payment.subscription_status) return null;
    const status = payment.subscription_status.toLowerCase();
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
    return {
      text: payment.subscription_status,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="p-6 space-y-8 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/payments/payments",
            label: "Payment Details",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Payment Details</h1>
      </div>

      {/* PAYMENT OVERVIEW CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="text-3xl font-bold tracking-tight">
              KES {amountPaid.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Breakdown */}
        {/* <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium">Paid to School</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              KES {paidToSchool.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-700 font-medium">Commission</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              KES {commission.toLocaleString()}
            </p>
          </div>
        </div> */}

        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Payment Phone</p>
            <p className="font-medium">{payment.phone_number}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Payment Date</p>
            <p className="font-medium">{paymentDate}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">{createdDate}</p>
          </div>
        </div>
      </div>

      {/* DISBURSEMENT DETAILS CARD */}
      {/* {payment.bank_paybill && (
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-4">
            Disbursement Details
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">School Name</p>
              <p className="font-medium">{payment.school_name ?? "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Bank Paybill</p>
              <p className="font-medium">{payment.bank_paybill}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">{payment.account_number ?? "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Disbursement Type</p>
              <p className="font-medium">
                {payment.disbursement_type ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* STUDENT DETAILS CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-4">Student Details</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Student Name</p>
            <p className="font-medium">{payment.student_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Student Account</p>
            <p className="font-medium">{payment.student_account ?? "N/A"}</p>
          </div>

          {payment.gender && (
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{payment.gender}</p>
            </div>
          )}

          {payment.service_type && (
            <div>
              <p className="text-sm text-muted-foreground">Service Type</p>
              <p className="font-medium capitalize">{payment.service_type}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">School</p>
            <p className="font-medium">{payment.school_name ?? "N/A"}</p>
          </div>

          {payment.term_name && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Payment Term</p>
                <p className="font-medium">{payment.term_name}</p>
              </div>

              {payment.term_start && payment.term_end && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Term Period</p>
                  <p className="font-medium">
                    {format(new Date(payment.term_start), "dd/MM/yyyy")} -{" "}
                    {format(new Date(payment.term_end), "dd/MM/yyyy")}
                  </p>
                </div>
              )}
            </>
          )}

          {payment.address && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{payment.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* PARENT DETAILS CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-4">Parent Details</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Parent Name</p>
            <p className="font-medium">{parentDisplay}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Parent Phone</p>
            <p className="font-medium">{payment.parent_phone ?? "N/A"}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Parent Email</p>
            <p className="font-medium">{payment.parent_email ?? "N/A"}</p>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION DETAILS CARD */}
      {/* {payment && (
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-semibold">Subscription Details</h2>
            {subscriptionStatus && (
              <div
                className={`inline-block px-3 py-1 rounded-full ${subscriptionStatus.bgColor}`}
              >
                <p className={`font-medium ${subscriptionStatus.color}`}>
                  {subscriptionStatus.text}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Total Paid</p>
              <p className="text-xl font-bold text-blue-900 mt-1">
                KES{" "}
                {Number(payment.subscription_total_paid ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Balance</p>
              <p className="text-xl font-bold text-orange-900 mt-1">
                KES {Number(payment.subscription_balance ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">
                Commission Status
              </p>
              <p className="text-xl font-bold text-purple-900 mt-1">
                {payment.is_commission_paid ? "Paid ✓" : "Unpaid"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {payment.subscription_start_date
                  ? format(
                      new Date(payment.subscription_start_date),
                      "dd/MM/yyyy"
                    )
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Expiry Date</p>
              <p className="font-medium">
                {payment.subscription_expiry_date
                  ? format(
                      new Date(payment.subscription_expiry_date),
                      "dd/MM/yyyy"
                    )
                  : "N/A"}
              </p>
            </div>

            {payment.days_access !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Days Access</p>
                <p className="font-medium">{payment.days_access} days</p>
              </div>
            )}

            {payment.last_payment_date && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Last Payment Date
                </p>
                <p className="font-medium">
                  {format(
                    new Date(payment.last_payment_date),
                    "dd/MM/yyyy HH:mm:ss"
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}
