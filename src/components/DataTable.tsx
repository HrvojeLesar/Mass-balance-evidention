import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { Pagination } from "../hooks/usePagination";
import BaseTable from "./BaseTable";
import TablePagination from "./TablePagination";

type SomeTableProps<T> = {
    columns: ColumnDef<T, unknown>[];
    data: { data: T[]; total: number };
    pagination: Pagination;
    setPagination: Dispatch<SetStateAction<Pagination>>;
    sorting?: SortingState;
    setSorting?: Dispatch<SetStateAction<SortingState>>;
    columnFilters?: ColumnFiltersState;
    setColumnFilters?: Dispatch<SetStateAction<ColumnFiltersState>>;
};

export default function DataTable<T>({
    columns,
    data,
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
}: SomeTableProps<T>) {
    const table = useReactTable({
        data: data.data,
        columns,
        pageCount: data ? Math.ceil(data.total / pagination.pageSize) : -1,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination,
            sorting,
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        sortDescFirst: false,
        enableColumnResizing: true,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: (filter) => {
            setPagination({ ...pagination, pageIndex: 0 });
            if (setColumnFilters) {
                setColumnFilters(filter);
            }
        },
    });

    return (
        <>
            <BaseTable table={table} />
            <TablePagination table={table} />
        </>
    );
}
