"use client"

import React from "react";
import DataTable from "react-data-table-component";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"
import { XCircleIcon, XIcon } from "lucide-react";

function commas(val: number) {
    const formatter = new Intl.NumberFormat('en-US', {
        // style: 'currency',
        currencyDisplay: 'code',
        currency: 'USD',
        currencySign: 'accounting',
        maximumFractionDigits: 2

        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });
    return formatter.format(val)
}

export default function GenTable({ title, cols, data, baseLink, uniqueKey }) {
    const router = useRouter()
    let columns: any = [];
    // replace created_at with date
    cols = cols.map((col) => col == 'created_at' ? 'date' : col)
    // make titles as capital
    // cols = cols.map((col) => col.charAt(0).toUpperCase() + col.slice(1))
    const [pending, setPending] = React.useState(true);
    const [rows, setRows] = React.useState([]);
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setRows(data);
            setPending(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, []);
    for (let index = 0; index < cols.length; index++) {
        const element = cols[index];
        var temp = {
            'name': element.charAt(0).toUpperCase() + element.slice(1),
            selector: row => row[element]
        }
        if ((element == 'tx_id') || (element == '_id')) {
            temp['sortable'] = false;
            temp['cell'] = row => <span className="text-primary underline"> {row['id']} </span>
        }
        if (element == 'created_at') {
            temp['cell'] = row => <span> {(row['created_at'] as Date).toLocaleDateString()} </span>
            temp['hide'] = 'sm'
            temp['sortable'] = true
        }
        if (element == 'amount') {
            temp['cell'] = row =>
                <span className={cn("font-semibold", row['kind'] == 'Withdrawal' ? "text-red-500" : "text-green-500")}>
                    {row['kind'] == 'Withdrawal' ? "-" : "+"} {commas(Number(row[element]))} {row['currency']}
                </span>
        }
        if (element == 'fees') {
            temp['cell'] = row => <span className="font-semibold"> {commas(Number(row['total_fees']))} </span>
            temp['hide'] = 'sm'
        }
        columns.push(temp)
    }
    const [filterText, setFilterText] = React.useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
    const filteredItems = data.filter(
        item => item.id && item.id.toString().toLowerCase().includes(filterText.toLowerCase()),
    );
    const FilterComponent = ({ filterText, onFilter, onClear, onExport, title }) => (
        <div className="flex gap-2 w-full items-center justify-between">
            <h1 className="font-semibold"> {title} </h1>
            <div className="flex gap-1 items-center">
                <div className="flex gap-1">
                    <Input
                        id="search"
                        type="text"
                        placeholder="Search"
                        aria-label="Search Input"
                        className="w-full"
                        defaultValue={filterText}
                        onChange={onFilter}
                    />
                    <Button size="icon" type="button" variant={"ghost"} onClick={onClear}>
                        <XCircleIcon className="text-red-500 h-4 w-4" />
                    </Button>
                </div>
                {/* <Export onExport={onExport} /> */}
            </div>
        </div>
    );
    const subHeaderComponentMemo = React.useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} title={title} filterText={filterText} onExport={() => downloadCSV(filterText != '' ? filteredItems : data)} />
        );
    }, [filterText, resetPaginationToggle]);
    const customStyles = {
        rows: {
            style: {
                minHeight: '72px', // override the row height
            },
        }
    };
    // const actionsMemo = React.useMemo(() => <Export onExport={() => downloadCSV(data)} />, []);

    return (<DataTable columns={columns} data={filterText != '' ? filteredItems : data}
        pagination
        highlightOnHover={true}
        pointerOnHover={true}
        onRowClicked={(row: any) => {
            router.push(baseLink + row[uniqueKey]);
        }}
        dense
        customStyles={customStyles}
        paginationResetDefaultPage={resetPaginationToggle}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        // selectableRows
        persistTableHead
        progressPending={pending}
    // actions={actionsMemo}
    />);
}

// const Export = ({ onExport }) => <button onClick={e => onExport()} className="my-0 text-xs bg-primary text-white px-2 py-1 rounded-md">Export to CSV</button>;

function convertArrayOfObjectsToCSV(data) {
    let result;
    let array = data;

    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    array.forEach(item => {
        let ctr = 0;
        keys.forEach(key => {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];

            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

// Blatant "inspiration" from https://codepen.io/Jacqueline34/pen/pyVoWr
function downloadCSV(array) {
    const link = document.createElement('a');
    let csv = convertArrayOfObjectsToCSV(array);
    if (csv == null) return;

    const filename = 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = `data:text/csv;charset=utf-8,${csv}`;
    }

    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
}