import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function PaymentTermDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const termId = parseInt(id, 10);

  if (isNaN(termId)) {
    return (
      <div className="p-6 text-red-600 font-semibold">Invalid term ID</div>
    );
  }

  const term = await database
    .selectFrom("payment_terms")
    .leftJoin("school", "school.id", "payment_terms.schoolId")
    .select([
      "payment_terms.id",
      "payment_terms.name",
      "payment_terms.start_date",
      "payment_terms.end_date",
      "payment_terms.is_active",
      "payment_terms.created_at",
      "payment_terms.updated_at",
      "school.name as school_name",
      "school.id as school_id",
    ])
    .where("payment_terms.id", "=", termId)
    .executeTakeFirst();

  if (!term) {
    notFound();
  }

  // Get statistics for this term
  const stats = await database
    .selectFrom("subscriptions")
    .select((eb) => [
      eb.fn.count("subscriptions.id").as("total_subscriptions"),
      eb.fn.sum("subscriptions.total_paid").as("total_revenue"),
      eb.fn.sum("subscriptions.balance").as("total_balance"),
    ])
    .where("subscriptions.term_id", "=", termId)
    .executeTakeFirst();

  // Get students associated with this term
  const students = await database
    .selectFrom("subscriptions")
    .innerJoin("student", "student.id", "subscriptions.student_id")
    .leftJoin("user as parent", "parent.id", "student.parentId")
    .select([
      "student.id",
      "student.name as student_name",
      "student.account_number",
      "parent.name as parent_name",
      "parent.email as parent_email",
      "subscriptions.status",
      "subscriptions.total_paid",
      "subscriptions.balance",
    ])
    .where("subscriptions.term_id", "=", termId)
    .orderBy("student.name", "asc")
    .execute();

  const startDate = format(new Date(term.start_date), "dd/MM/yyyy");
  const endDate = format(new Date(term.end_date), "dd/MM/yyyy");
  const createdDate = format(new Date(term.created_at), "dd/MM/yyyy HH:mm:ss");
  const updatedDate = format(new Date(term.updated_at), "dd/MM/yyyy HH:mm:ss");

  const totalSubscriptions = Number(stats?.total_subscriptions ?? 0);
  const totalRevenue = Number(stats?.total_revenue ?? 0);
  const totalBalance = Number(stats?.total_balance ?? 0);

  return (
    <div className="p-6 space-y-8 w-full">
      <Breadcrumbs
        items={[
          {
            href: "/payment-terms",
            label: "Payment Terms",
          },
          {
            href: `/payment-terms/${termId}`,
            label: term.name,
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Payment Term Details
        </h1>
        <div
          className={`inline-block px-3 py-1 rounded-full ${
            term.is_active ? "bg-green-50" : "bg-gray-50"
          }`}
        >
          <p
            className={`font-medium ${
              term.is_active ? "text-green-600" : "text-gray-600"
            }`}
          >
            {term.is_active ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      {/* STATISTICS CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-4">Statistics</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">
              Total Subscriptions
            </p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {totalSubscriptions}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              KES {totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm text-orange-700 font-medium">
              Outstanding Balance
            </p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              KES {totalBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* TERM INFORMATION CARD */}
      <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-4">
          Term Information
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Term Name</p>
            <p className="font-medium text-lg">{term.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">School</p>
            <p className="font-medium text-lg">{term.school_name ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{startDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">{endDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">{createdDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Updated At</p>
            <p className="font-medium">{updatedDate}</p>
          </div>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      {students.length > 0 && (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Students ({students.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const parentName =
                    student.parent_name && student.parent_name.trim() !== ""
                      ? student.parent_name
                      : (student.parent_email?.split("@")[0] ?? "N/A");

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.account_number ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.status === "active"
                              ? "bg-green-100 text-green-800"
                              : student.status === "expired"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {Number(student.total_paid ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {Number(student.balance ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="rounded-2xl border bg-white shadow-sm p-12">
          <p className="text-center text-sm text-gray-500">
            No students enrolled in this term yet.
          </p>
        </div>
      )}
    </div>
  );
}
