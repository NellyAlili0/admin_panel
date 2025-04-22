import { Button } from "@/components/ui/button";
import { db } from "@repo/database";
import { DataTableTransactions } from "./transactions";
import { DriverTXForm, RideTXForm } from "./form";

export default async function Page() {
    // view transactions.
    // add transaction
    const tx = await db.selectFrom('payment')
        .select(['id', 'amount', 'paybill_number', 'payment_method', 'payment.comments', 'payment.meta', 'payment.created_at', 'payment_status'])
        .orderBy('created_at', 'desc')
        .execute();

    // get unpaid rides set to pending in last 30 days
    const unpaidRides = await db.selectFrom('ride')
        .select(['ride.id', 'ride.comments', 'ride.admin_comments', 'ride.meta'])
        .where('status', '=', 'Pending')
        .where('driver_id', 'is not', null)
        .where('vehicle_id', 'is not', null)
        .where('parent_id', 'is not', null)
        .where('student_id', 'is not', null)
        .where('created_at', '>=', new Date(new Date().setDate(new Date().getDate() - 30)))
        .execute();


    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Transactions</h1>
                <div className="flex gap-2 items-center">
                    <DriverTXForm />
                    {/* <RideTXForm /> */}
                </div>
            </div>
            <DataTableTransactions tx={tx} />
        </div>
    );
}