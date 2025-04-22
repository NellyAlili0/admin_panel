import { db } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function Page() {
    // monthly revenue, driver earnings, recent transactions
    const revenue = await db.selectFrom('payment')
        .select([b => b.fn.sum("amount").as("total")])
        .where('payment_status', '=', 'Paid')
        .where('driver_id', 'is', null)
        .executeTakeFirst();

    const driverEarnings = await db.selectFrom('payment')
        .select([b => b.fn.sum("amount").as("total")])
        .where('payment_status', '=', 'Paid')
        .where('driver_id', 'is not', null)
        .executeTakeFirst();

    const averageEarnings = await db.selectFrom('payment')
        .select([b => b.fn.avg("amount").as("total")])
        .where('payment_status', '=', 'Paid')
        .where('driver_id', 'is not', null)
        .executeTakeFirst();

    const recentTransactions = await db.selectFrom('payment')
        .select(['id', 'amount', 'paybill_number', 'payment_method', 'comments', 'meta', 'created_at', 'payment_status'])
        .orderBy('created_at', 'desc')
        .limit(10)
        .execute();

    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold">Finance</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium"> Revenue </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{revenue?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium"> Total Driver Earnings </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driverEarnings?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium"> Average Driver Earnings </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageEarnings?.total || 0}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="">
                <h1 className="text-2xl font-bold">Recent Transactions</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]"> Amount </TableHead>
                            <TableHead className="w-[100px]"> Method </TableHead>
                            <TableHead className="w-[100px]"> Comments </TableHead>
                            <TableHead className="w-[100px]"> Created At </TableHead>
                            <TableHead className="w-[100px]"> Payment Status </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="w-[100px]"> {transaction.amount} </TableCell>
                                <TableCell className="w-[100px]"> {transaction.payment_method} </TableCell>
                                <TableCell className="w-[100px]"> {transaction.comments} </TableCell>
                                <TableCell className="w-[100px]"> {transaction.created_at.toLocaleDateString()} </TableCell>
                                <TableCell className="w-[100px]"> {transaction.payment_status} </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}