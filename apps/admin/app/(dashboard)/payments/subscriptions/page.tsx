import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { SubscriptionSearch } from "./search-bar";

export default async function Page() {
  // Fetch schools with student count
  const subsRaw = await database
    .selectFrom("subscriptions")
    .innerJoin("student", "student.id", "subscriptions.student_id")
    .leftJoin("user as parent", "parent.id", "student.parentId")
    .leftJoin("school", "school.id", "student.schoolId")
    .select([
      "subscriptions.id",
      "subscriptions.total_paid",
      "subscriptions.status",
      "student.name as student_name",

      "parent.name as parent_name",
      "parent.email as parent_email",

      "school.name as school_name",
    ])
    .orderBy("subscriptions.id", "desc")
    .execute();

  const subscriptions = subsRaw.map((s) => ({
    ...s,
    parent_name:
      s.parent_name && s.parent_name.trim() !== ""
        ? s.parent_name
        : s.parent_email,
    status_label: s.status === "active" ? "PAID" : "UNPAID",
    total_paid: s.total_paid ?? 0,
    school_name: s.school_name ?? "N/A",
  }));

  const totalSubscriptions = subscriptions.length;

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "payments/subscriptions",
            label: "All Subscriptions",
          },
        ]}
      />

      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paid Students</h1>
          <p className="text-muted-foreground my-1">
            Total of {totalSubscriptions} students paid
          </p>
        </div>
      </div>

      {/* Client-side search & table */}
      <SubscriptionSearch data={subscriptions} />
    </div>
  );
}
