"use client";

import React from "react";
import DataTable, { TableStyles } from "react-data-table-component";
import { useRouter } from "next/navigation";

interface GenTableProps {
  title: string;
  cols: string[];
  data: any[];
  baseLink?: string;
  uniqueKey?: string;
  pagination?: boolean;
  paginationServer?: boolean;
  paginationTotalRows?: number;
  paginationPerPage?: number;
  onChangePage?: (page: number) => void;
  progressPending?: boolean;
}

export default function GenTable({
  title,
  cols,
  data,
  baseLink = "",
  uniqueKey = "",
  pagination = true,
  paginationServer = false,
  paginationTotalRows = 0,
  paginationPerPage = 15,
  onChangePage,
  progressPending = false,
}: GenTableProps) {
  const router = useRouter();
  const columns: any[] = [];

  // Hide ID fields
  const visibleCols = cols.filter(
    (col) =>
      col.toLowerCase() !== "id" &&
      col.toLowerCase() !== uniqueKey.toLowerCase()
  );

  // Rename created_at → date
  const normalizedCols = visibleCols.map((col) =>
    col === "created_at" ? "date" : col
  );

  for (const element of normalizedCols) {
    const temp: any = {
      name:
        element.charAt(0).toUpperCase() + element.slice(1).replaceAll("_", " "),
      selector: (row: any) => row[element],
      wrap: true,
      style: {}, // IMPORTANT: width styles go inside style object
    };

    // Width rules
    if (element === "student" || element === "driver") {
      temp.style.minWidth = "150px";
      temp.style.maxWidth = "200px";
    } else if (
      element === "scheduled_time" ||
      element === "embark_time" ||
      element === "disembark_time"
    ) {
      temp.style.minWidth = "180px";
      temp.style.maxWidth = "220px";
    } else if (element === "vehicle_registration_number") {
      temp.style.minWidth = "120px";
      temp.style.maxWidth = "150px";
    } else if (element === "kind" || element === "status") {
      temp.style.minWidth = "100px";
      temp.style.maxWidth = "120px";
    } else if (
      element === "pickup_location" ||
      element === "dropoff_location"
    ) {
      temp.style.minWidth = "180px";
      temp.style.maxWidth = "250px";
    } else {
      temp.style.minWidth = "120px";
    }

    // Date columns formatting
    if (
      element === "date" ||
      element === "start_time" ||
      element === "end_time"
    ) {
      temp.cell = (row: any) => {
        try {
          return <span>{new Date(row[element]).toLocaleString()}</span>;
        } catch {
          return <span>{row[element]}</span>;
        }
      };
      temp.sortable = true;
    }

    // Status badge
    if (element === "status") {
      temp.cell = (row: any) => {
        const status = row[element];
        const statusColor =
          status === "Active"
            ? "bg-green-100 text-green-800"
            : status === "Inactive"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
          >
            {status}
          </span>
        );
      };
    }

    // Kind badge
    if (element === "kind") {
      temp.cell = (row: any) => {
        const kind = row[element];
        const kindColor =
          kind === "Pickup"
            ? "bg-blue-100 text-blue-800"
            : "bg-purple-100 text-purple-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${kindColor}`}
          >
            {kind}
          </span>
        );
      };
    }

    columns.push(temp);
  }

  const customStyles: TableStyles = {
    rows: {
      style: {
        minHeight: "80px",
        fontSize: "14px",
      },
    },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "600",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "12px",
        paddingBottom: "12px",
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        lineHeight: "1.5",
      },
    },
    table: {
      style: {
        minWidth: "100%", // Ensures table tries to fill space, but overflow wrapper handles small screens
      },
    },
  };

  return (
    // UPDATED: Standardized Wrapper
    <div className="w-full overflow-x-auto bg-background rounded-md border">
      <DataTable
        title={title}
        columns={columns}
        data={data}
        pagination={pagination}
        paginationServer={paginationServer}
        paginationTotalRows={paginationTotalRows}
        paginationPerPage={paginationPerPage}
        onChangePage={onChangePage}
        highlightOnHover
        pointerOnHover
        dense={false}
        onRowClicked={(row: any) => {
          if (uniqueKey && row[uniqueKey]) {
            router.push(`${baseLink}${row[uniqueKey]}`);
          }
        }}
        customStyles={customStyles}
        subHeader
        persistTableHead
        progressPending={progressPending}
      />
    </div>
  );
}
