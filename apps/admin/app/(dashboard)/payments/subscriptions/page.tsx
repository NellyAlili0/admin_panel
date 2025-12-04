import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { SubscriptionSearch } from "./search-bar";
import { EditSubscription } from "./[id]/forms";

const formatTransCompletedTime = (rawResult: any) => {
  console.log(rawResult);
  if (!rawResult) return "N/A";

  try {
    // Handle if raw_result is a string (needs parsing)
    const parsedResult =
      typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;

    if (parsedResult?.ResultParameters?.ResultParameter) {
      const params = parsedResult.ResultParameters.ResultParameter;

      // Ensure params is an array (handle single object or array)
      const paramsArray = Array.isArray(params) ? params : [params];

      const transTimeParam = paramsArray.find(
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
      "student.daily_fee",

      "parent.name as parent_name",
      "parent.email as parent_email",

      "school.name as school_name",
      "subscriptions.expiry_date",
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
    expiry_date: s.expiry_date
      ? new Date(s.expiry_date).toLocaleDateString()
      : "N/A",
    daily_fee: s.daily_fee ?? "N/A",
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
