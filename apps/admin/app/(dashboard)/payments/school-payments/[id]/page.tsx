import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function B2cTransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transactionId = parseInt(id, 10);

  if (isNaN(transactionId)) {
    notFound();
  }

  const transaction = await database
    .selectFrom("b2cmpesa_transactions as b2c")
    .leftJoin(
      "school_disbursements as sd",
      "b2c.conversation_id",
      "sd.transaction_id"
    )
    .leftJoin("student", "sd.studentId", "student.id")
    .leftJoin("user as parent", "parent.id", "student.parentId")
    .leftJoin("school", "student.schoolId", "school.id")
    .select([
      // B2C Transaction fields
      "b2c.id",
      "b2c.transaction_id",
      "b2c.transaction_amount",
      "b2c.receiver_party_public_name",
      "b2c.raw_result",
      "b2c.created_at",

      // School Disbursement fields
      "sd.bank_paybill",
      "sd.account_number",
      "sd.disbursement_type",

      // Student fields
      "student.name as student_name",
      "student.gender as student_gender",

      // Parent fields
      "parent.name as parent_name",
      "parent.email as parent_email",
      "parent.phone_number as parent_phone",

      // School fields
      "school.name as school_name",
    ])
    .where("b2c.id", "=", transactionId)
    .executeTakeFirst();

  if (!transaction) {
    notFound();
  }

  // Extract TransCompletedTime from raw_result
  const getTransCompletedTime = () => {
    if (!transaction.raw_result) return "N/A";

    try {
      const rawResult = transaction.raw_result as any;

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

  const transCompletedTime = getTransCompletedTime();
  const createdDate = format(
    new Date(transaction.created_at),
    "dd/MM/yyyy HH:mm:ss"
  );
  const amount = Number(transaction.transaction_amount ?? 0);

  // Format gender
  const formatGender = (gender: string | null) => {
    if (!gender) return "N/A";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Get parent name from name field or extract from email
  const getParentName = () => {
    if (transaction.parent_name && transaction.parent_name.trim() !== "") {
      return transaction.parent_name;
    }
    if (transaction.parent_email) {
      const emailPrefix = transaction.parent_email.split("@")[0];
      return emailPrefix;
    }
    return "N/A";
  };

  const parentName = getParentName();

  return (
    <div className="p-6 space-y-8 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/payments/b2c-mpesa",
            label: "B2C M-Pesa Transactions",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          B2C Transaction Details
        </h1>
      </div>

      {/* TRANSACTION INFORMATION CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-4">
          Transaction Information
        </h2>

        <div className="space-y-1 pb-4 border-b">
          <p className="text-sm text-muted-foreground">Transaction Amount</p>
          <p className="text-3xl font-bold tracking-tight">
            KES {amount.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Transaction ID</p>
            <p className="font-medium">{transaction.transaction_id ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Receiver Name</p>
            <p className="font-medium">
              {transaction.receiver_party_public_name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Completed At</p>
            <p className="font-medium">{transCompletedTime}</p>
          </div>
        </div>
      </div>

      {/* DISBURSEMENT DETAILS CARD */}
      {transaction.bank_paybill && (
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-4">
            Disbursement Details
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">School Name</p>
              <p className="font-medium">{transaction.school_name ?? "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Bank Paybill</p>
              <p className="font-medium">{transaction.bank_paybill}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">
                {transaction.account_number ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Disbursement Type</p>
              <p className="font-medium">
                {transaction.disbursement_type ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT & PARENT DETAILS CARD */}
      {transaction.student_name && (
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-4">
            Student & Parent Details
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-medium">{transaction.student_name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Student Gender</p>
              <p className="font-medium">
                {formatGender(transaction.student_gender)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Parent Name</p>
              <p className="font-medium">{parentName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Parent Email</p>
              <p className="font-medium">{transaction.parent_email ?? "N/A"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">
                Parent Phone Number
              </p>
              <p className="font-medium">{transaction.parent_phone ?? "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
