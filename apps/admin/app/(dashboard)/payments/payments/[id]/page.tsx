import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { format } from "date-fns";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const payment = await database
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
      "student.id as student_id",

      "parent.name as parent_name",
      "parent.email as parent_email",
      "parent.phone_number as parent_phone",

      "school.name as school_name",
      "school.id as school_id",
    ])
    .where("payment.id", "=", Number(id))
    .executeTakeFirst();

  if (!payment) {
    return (
      <div className="p-6 text-red-600 font-semibold">Payment not found</div>
    );
  }

  const parentDisplay =
    payment.parent_name && payment.parent_name.trim() !== ""
      ? payment.parent_name
      : payment.parent_email;

  const paymentDate = format(
    new Date(payment.created_at),
    "dd/MM/yyyy HH:mm:ss"
  );

  return (
    <div className="p-6 space-y-8 w-full">
      <Breadcrumbs
        items={[
          {
            href: "payments/payments",
            label: "Payments Details",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Payment Details</h1>
      </div>

      {/* MAIN CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="text-3xl font-bold tracking-tight">
              KES {payment.amount}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{paymentDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Payment ID</p>
            <p className="font-medium">{payment.id}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Transaction ID</p>
            <p className="font-medium">{payment.transaction_id ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Student</p>
            <p className="font-medium">{payment.student_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Parent</p>
            <p className="font-medium">{parentDisplay}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{payment.parent_phone ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">School</p>
            <p className="font-medium">{payment.school_name ?? "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
