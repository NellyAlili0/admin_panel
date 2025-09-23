import { database } from "@/database/config";
import Link from "next/link";
import React from "react";

async function SystemLogs() {
  const schools = await database
    .selectFrom("school")
    .select([
      "school.id",
      "school.name",
      "school.location",
      "school.url",
      (eb) =>
        eb
          .selectFrom("student")
          .select((eb) => eb.fn.countAll().as("count"))
          .whereRef("student.schoolId", "=", "school.id")
          .as("students"),
    ])
    .execute();

  const { count } = await database
    .selectFrom("student")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("student.schoolId", "is", null) // <-- count only NULL schoolId
    .executeTakeFirstOrThrow();

  console.log("Students without school:", count);

  const totalSchools = schools.length;

  return (
    <section className="px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-3xl font-bold text-gray-800 mt-1">
          School & Student Reports
        </p>
        <div className="w-20 h-1 bg-[#efb100] mt-3 rounded-full"></div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* School Reports */}
        <Link href="/system-logs/schools">
          <div className="group bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-200 hover:border-[#efb100] hover:shadow-md transition">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">
                Total Schools
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalSchools}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#efb100]/10 text-[#efb100] group-hover:bg-[#efb100]/20 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </Link>

        {/* Student Reports */}
        <Link href="/system-logs/students">
          <div className="group bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-200 hover:border-[#efb100] hover:shadow-md transition">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">
                Total Students
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#efb100]/10 text-[#efb100] group-hover:bg-[#efb100]/20 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default SystemLogs;
