"use client";

import React from "react";
import DataTable from "react-data-table-component";
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
    const temp = {
      name: element.charAt(0).toUpperCase() + element.slice(1),
      selector: (row) => row[element],
    };
    if (element == "tx_id" || element == "_id") {
      temp["sortable"] = false;
      temp["cell"] = (row) => (
        <span className="text-primary underline"> {row["id"]} </span>
      );
    }
    if (
      element == "created_at" ||
      element == "date" ||
      element == "start_time" ||
      element == "end_time"
    ) {
      try {
        temp["cell"] = (row) => (
          <span> {(row[element] as Date).toLocaleString()} </span>
        );
      } catch (error) {
        temp["cell"] = (row) => <span> {row[element]} </span>;
      }
      temp["hide"] = "sm";
      temp["sortable"] = true;
    }
    columns.push(temp);
  }
  // const [filterText, setFilterText] = React.useState('');
  const [resetPaginationToggle, setResetPaginationToggle] =
    React.useState(false);
  const customStyles = {
    rows: {
      style: {
        minHeight: "72px", // override the row height
      },
    },
  };
  // const actionsMemo = React.useMemo(() => <Export onExport={() => downloadCSV(data)} />, []);

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
      // subHeaderComponent={subHeaderComponentMemo}
      // selectableRows
      persistTableHead
      progressPending={pending}
      // actions={actionsMemo}
    />
  );
}

function convertArrayOfObjectsToCSV(data) {
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

function downloadCSV(array) {
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
