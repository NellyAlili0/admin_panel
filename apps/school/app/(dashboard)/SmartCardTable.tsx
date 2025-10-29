"use client";

import React from "react";
import DataTable, { TableStyles } from "react-data-table-component";
import { useRouter } from "next/navigation";

export default function GenTable({
  title,
  cols,
  data,
  baseLink = "",
  uniqueKey = "",
}) {
  const router = useRouter();
  const columns: any = [];

  // ✅ Always exclude `id` from displayed columns
  const visibleCols = cols.filter(
    (col) =>
      col.toLowerCase() !== "id" &&
      col.toLowerCase() !== uniqueKey.toLowerCase()
  );

  // ✅ Replace `created_at` with `date` for UI consistency
  const normalizedCols = visibleCols.map((col) =>
    col === "created_at" ? "date" : col
  );

  const [pending, setPending] = React.useState(true);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setRows(data);
      setPending(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [data]);

  // ✅ Dynamically build visible columns
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

  const [resetPaginationToggle, setResetPaginationToggle] =
    React.useState(false);

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
      pagination
      highlightOnHover
      pointerOnHover
      dense
      onRowClicked={(row: any) => {
        // ✅ If uniqueKey exists and is found in row, navigate
        if (uniqueKey && row[uniqueKey]) {
          router.push(`${baseLink}${row[uniqueKey]}`);
        }
      }}
      customStyles={customStyles}
      paginationResetDefaultPage={resetPaginationToggle}
      subHeader
      persistTableHead
      progressPending={pending}
    />
  );
}
