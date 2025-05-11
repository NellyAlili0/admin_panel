import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { db, sql } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, TrendingUp, Fuel } from "lucide-react";

export default async function Page() {
  // total drivers amount
  // recent transactions
  // total earnings,
  // total withdraws
  let metrics: any = await sql`SELECT 
    (SELECT SUM("wallet_balance") FROM public."user" WHERE "kind" = 'Driver') as driver_balance,
    (SELECT COUNT(*) FROM public."payment") as total_transactions,
    (SELECT SUM(amount) FROM public."payment" WHERE "kind" = 'Deposit') as total_deposits,
    (SELECT SUM(amount) FROM public."payment" WHERE "kind" = 'Withdrawal') as total_withdraws
    `.execute(db);
  let driverBalance = metrics.rows[0].driver_balance;
  let totalTransactions = metrics.rows[0].total_transactions;
  let totalDeposits = metrics.rows[0].total_deposits;
  let totalWithdraws = metrics.rows[0].total_withdraws;

  let recentTransactions = await db
    .selectFrom("payment")
    .select([
      "payment.id",
      "payment.amount",
      "payment.kind",
      "payment.comments",
      "payment.transaction_type as type",
      "payment.created_at",
    ])
    .orderBy("payment.created_at", "desc")
    .execute();
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/finance",
            label: "Finance",
          },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground"> Finance Transactions </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Driver Balance
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverBalance} KES</div>
            <p className="text-xs text-muted-foreground">All Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions} KES </div>
            <p className="text-xs text-muted-foreground">All Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeposits} KES</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdraws</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithdraws} KES</div>
            <p className="text-xs text-muted-foreground">All Withdraws</p>
          </CardContent>
        </Card>
      </div>
      <GenTable
        title="All Finance"
        cols={["id", "amount", "kind", "comments", "type", "created_at"]}
        data={recentTransactions}
        baseLink="/finance/"
        uniqueKey=""
      />
    </div>
  );
}
