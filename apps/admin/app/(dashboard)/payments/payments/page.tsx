import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { PaymentSearch } from "./search-bar";

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "N/A";

  try {
    // If it's already converted by PostgreSQL, just format it
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "Error formatting date";
  }
};
export default async function Page() {
  const paymentsRaw = await database
    .selectFrom("payment")
    .innerJoin("student", "student.id", "payment.userId")
    .leftJoin("user as parent", "parent.id", "student.parentId")
    .leftJoin("school", "school.id", "student.schoolId")
    .select([
      "payment.id",
      "payment.amount",
      "payment.transaction_id",
      "payment.created_at",

      "student.name as student_name",

      "parent.name as parent_name",
      "parent.email as parent_email",
      "parent.phone_number as parent_phone",

      "school.name as school_name",
    ])
    .orderBy("payment.created_at", "desc")
    .execute();

  const totalAmount = await database
    .selectFrom("payment")
    .select((eb) => eb.fn.sum("payment.amount").as("total"))
    .executeTakeFirst();

  const totalPaid = Number(totalAmount?.total ?? 0);

  const payments = paymentsRaw.map((p) => ({
    ...p,
    parent_name: p.parent_name === "" ? p.parent_email : p.parent_name,
    payment_date: formatTimestamp(p.created_at),
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
              Total Payments Made
            </p>
            <p className="text-3xl font-bold tracking-tight my-1">
              KES {totalPaid.toLocaleString()}
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
