import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { PaymentSearch } from "./search-bar";

const formatTransCompletedTime = (rawResult: any) => {
  if (!rawResult) return "N/A";

  try {
    // Handle if raw_result is a string (needs parsing)
    const parsedResult =
      typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;

    if (parsedResult?.ResultParameters?.ResultParameter) {
      const params = parsedResult.ResultParameters.ResultParameter;
      const transTimeParam = params.find(
        (p: any) => p.Key === "TransCompletedTime"
      );

      if (transTimeParam?.Value) {
        // Format: "20251121093744" -> "21/11/2025 09:37:44"
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

export default async function Page() {
  const paymentsRaw = await database
    .selectFrom("student_payments")
    .innerJoin("student", "student.id", "student_payments.studentId")
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
    .select([
      "student_payments.id",
      "student_payments.phone_number",
      "student_payments.amount_paid",

      "student.name as student_name",

      "school.name as school_name",

      "school_disbursements.amount_disbursed as paid_to_school",

      "b2cmpesa_transactions.raw_result",
    ])
    .orderBy("student_payments.created_at", "desc")
    .execute();

  const totalAmount = await database
    .selectFrom("school_disbursements")
    .select((eb) =>
      eb.fn.sum("school_disbursements.amount_disbursed").as("total")
    )
    .executeTakeFirst();

  const totalDisbursed = Number(totalAmount?.total ?? 0);

  const payments = paymentsRaw.map((p) => ({
    ...p,
    amount_paid: Number(p.amount_paid ?? 0),
    paid_to_school: Number(p.paid_to_school ?? 0),
    school_name: p.school_name ?? "N/A",
    payment_date: formatTransCompletedTime(p.raw_result),
  }));

  const totalPayments = payments.length;

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "payments/payments",
            label: "All Payments",
          },
        ]}
      />

      <div className="mt-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground my-1">
              Total Amount Disbursed
            </p>
            <p className="text-3xl font-bold tracking-tight my-1">
              KES {totalDisbursed.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Number of Records</p>
            <p className="font-medium text-lg">{totalPayments}</p>
          </div>
        </div>
      </div>

      <PaymentSearch data={payments} />
    </div>
  );
}
