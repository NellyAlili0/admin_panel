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
    .selectFrom("b2cmpesa_transactions")
    .select([
      "id",
      "transaction_id",
      "transaction_amount",
      "receiver_party_public_name",
      "transaction_completed_at",
      "created_at",
      "result_type",
      "result_code",
      "result_desc",
    ])
    .where("id", "=", transactionId)
    .executeTakeFirst();

  if (!transaction) {
    notFound();
  }

  const transactionCompletedDate = transaction.transaction_completed_at
    ? format(
        new Date(transaction.transaction_completed_at),
        "dd/MM/yyyy HH:mm:ss"
      )
    : "N/A";

  const createdDate = format(
    new Date(transaction.created_at),
    "dd/MM/yyyy HH:mm:ss"
  );

  const amount = Number(transaction.transaction_amount ?? 0);

  // Determine result status display
  const getResultStatus = () => {
    if (transaction.result_code === 0) {
      return { text: "Success", color: "text-green-600" };
    } else if (
      transaction.result_code !== null &&
      transaction.result_code !== 0
    ) {
      return { text: "Failed", color: "text-red-600" };
    }
    return { text: "Pending", color: "text-yellow-600" };
  };

  const resultStatus = getResultStatus();

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

      {/* MAIN CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Transaction Amount</p>
            <p className="text-3xl font-bold tracking-tight">
              KES {amount.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className={`font-medium text-lg ${resultStatus.color}`}>
              {resultStatus.text}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
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
            <p className="font-medium">{transactionCompletedDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">{createdDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Result Type</p>
            <p className="font-medium">{transaction.result_type ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Result Code</p>
            <p className="font-medium">{transaction.result_code ?? "N/A"}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Result Description</p>
            <p className="font-medium">{transaction.result_desc ?? "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
