import Link from "next/link";
import { Database } from "lucide-react"; // optional icon

export default function NoData() {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <Database className="h-16 w-16 text-[#efb100]" aria-hidden="true" />
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          No Data Found
        </h1>

        {/* Description */}
        <p className="mt-4 text-lg text-gray-600">
          The requested information is not available right now. Please try again
          later or contact our support team for assistance.
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-x-4">
          <Link
            href="/overview"
            className="rounded-lg bg-[#efb100] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#e0a800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#efb100]"
          >
            Back to Dashboard
          </Link>
          <a
            href="https://www.zidallie.co.ke/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 hover:text-[#efb100]"
          >
            Contact Support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
