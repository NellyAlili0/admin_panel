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
  const columns: any = [];

  // Always exclude `id` from displayed columns
  const visibleCols = cols.filter(
    (col) =>
      col.toLowerCase() !== "id" &&
      col.toLowerCase() !== uniqueKey.toLowerCase()
  );

  // Replace `created_at` with `date` for UI consistency
  const normalizedCols = visibleCols.map((col) =>
    col === "created_at" ? "date" : col
  );

  // Dynamically build visible columns
  for (const element of normalizedCols) {
    const temp: any = {
      name:
        element.charAt(0).toUpperCase() + element.slice(1).replaceAll("_", " "),
      selector: (row: any) => row[element],
    };

    if (
      element === "created_at" ||
      element === "date" ||
      element === "start_time" ||
      element === "end_time"
    ) {
      temp["cell"] = (row: any) => {
        try {
          return <span>{new Date(row[element]).toLocaleString()}</span>;
        } catch {
          return <span>{row[element]}</span>;
        }
      };
      temp["sortable"] = true;
    }

    columns.push(temp);
  }

  const customStyles: TableStyles = {
    rows: { style: { minHeight: "72px" } },
    cells: {
      style: {
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
      },
    },
  };

  return (
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
      dense
      onRowClicked={(row: any) => {
        // If uniqueKey exists and is found in row, navigate
        if (uniqueKey && row[uniqueKey]) {
          router.push(`${baseLink}${row[uniqueKey]}`);
        }
      }}
      customStyles={customStyles}
      subHeader
      persistTableHead
      progressPending={progressPending}
    />
  );
}
