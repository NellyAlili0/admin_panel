"use client";

import React from "react";
import DataTable, { TableStyles } from "react-data-table-component";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface GenTableProps {
  title: string;
  cols: string[];
  data: any[];
  baseLink: string;
  uniqueKey: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function GenTable({
  title,
  cols,
  data,
  baseLink,
  uniqueKey,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: GenTableProps) {
  const router = useRouter();
  const columns: any = [];

  // replace created_at with date
  cols = cols.map((col) => (col == "created_at" ? "date" : col));
  const [pending, setPending] = React.useState(true);
  const [rows, setRows] = React.useState<any[]>([]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setRows(data);
      setPending(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [data]);

  for (let index = 0; index < cols.length; index++) {
    const element = cols[index];
    const temp: any = {
      name: element.charAt(0).toUpperCase() + element.slice(1),
      selector: (row: any) => row[element],
    };
    if (element == "tx_id" || element == "_id") {
      temp["sortable"] = false;
      temp["cell"] = (row: any) => (
        <span className="text-primary underline">{row[element]}</span>
      );
    }

    if (
      element == "created_at" ||
      element == "date" ||
      element == "start_time" ||
      element == "end_time" ||
      element == "time_in" ||
      element == "time_out"
    ) {
      temp["cell"] = (row: any) => {
        const value = row[element];
        if (!value) {
          return <span className=" text-gray-400">N/A</span>;
        }
        try {
          return <span>{new Date(value).toLocaleString()}</span>;
        } catch (error) {
          return <span>{value}</span>;
        }
      };
      temp["hide"] = "sm";
      temp["sortable"] = true;
    }

    columns.push(temp);
  }

  const [resetPaginationToggle, setResetPaginationToggle] =
    React.useState(false);

  // ✅ Proper TableStyles typing
  const customStyles: TableStyles = {
    rows: {
      style: {
        minHeight: "72px",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        wordBreak: "break-all",
        overflowWrap: "anywhere",
      },
    },
  };

  // Custom pagination component
  const CustomPagination = () => {
    if (!onPageChange || totalPages <= 1) return null;

    const getPageNumbers = (): (number | string)[] => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisible - 1);

        if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push("...");
        }

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (end < totalPages) {
          if (end < totalPages - 1) pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center space-x-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() =>
                typeof page === "number" ? onPageChange(page) : undefined
              }
              disabled={page === "..." || page === currentPage}
              className={`px-3 py-2 text-sm rounded-md border ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : page === "..."
                    ? "cursor-default"
                    : "hover:bg-gray-50"
              } ${page === "..." ? "disabled:opacity-100" : "disabled:opacity-50"} disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          ))}

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        pagination={false} // Disable built-in pagination
        highlightOnHover={true}
        pointerOnHover={true}
        onRowClicked={(row: any) => {
          if (uniqueKey != "") {
            router.push(baseLink + row[uniqueKey]);
          }
        }}
        dense
        customStyles={customStyles}
        paginationResetDefaultPage={resetPaginationToggle}
        subHeader
        persistTableHead
        progressPending={pending}
      />

      {/* Custom pagination */}
      <CustomPagination />
    </div>
  );
}
