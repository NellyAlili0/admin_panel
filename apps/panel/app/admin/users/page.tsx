import { db } from "@repo/database";
import { Form, UpdateUserForm } from "./form";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export default async function Page() {
    const users = await db.selectFrom("admin").selectAll().execute();
    return <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xl font-bold"> Administrators </p>
                <p className="text-sm text-muted-foreground"> Manage your users here </p>
            </div>
            <Form />
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]"> Names </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-right">{user.status}</TableCell>
                        <TableCell className="text-right">
                            <UpdateUserForm user={user} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

    </div>;
}
