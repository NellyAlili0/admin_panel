"use client";

import React from "react";
import DataTable, { TableStyles } from "react-data-table-component";
import { useRouter } from "next/navigation";

export default function GenTable({ title, cols, data, baseLink, uniqueKey }) {
  const router = useRouter();
  const columns: any = [];

  // replace created_at with date
  cols = cols.map((col) => (col == "created_at" ? "date" : col));
  const [pending, setPending] = React.useState(true);
  const [rows, setRows] = React.useState([]);

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
      element == "end_time"
    ) {
      try {
        temp["cell"] = (row: any) => (
          <span>{(row[element] as Date).toLocaleString()}</span>
        );
      } catch (error) {
        temp["cell"] = (row: any) => <span>{row[element]}</span>;
      }
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
        wordBreak: "break-all", // valid union value
        overflowWrap: "anywhere", // ensures long text wraps (like break-word)
      },
    },
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination
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
  );
}

function convertArrayOfObjectsToCSV(data: any[]) {
  let result;
  const array = data;

  const columnDelimiter = ",";
  const lineDelimiter = "\n";
  const keys = Object.keys(data[0]);

  result = "";
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  array.forEach((item) => {
    let ctr = 0;
    keys.forEach((key) => {
      if (ctr > 0) result += columnDelimiter;
      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

function downloadCSV(array: any[]) {
  const link = document.createElement("a");
  let csv = convertArrayOfObjectsToCSV(array);
  if (csv == null) return;

  const filename = "export.csv";

  if (!csv.match(/^data:text\/csv/i)) {
    csv = `data:text/csv;charset=utf-8,${csv}`;
  }

  link.setAttribute("href", encodeURI(csv));
  link.setAttribute("download", filename);
  link.click();
}
