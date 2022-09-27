import {
    ColumnDef,
    ColumnFiltersState,
    createRow,
    getCoreRowModel,
    getExpandedRowModel,
    getGroupedRowModel,
    GroupingState,
    memo,
    RowData,
    RowModel,
    SortingState,
    Table,
    useReactTable,
} from "@tanstack/react-table";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { Button } from "react-bootstrap";
import { Pagination } from "../hooks/usePagination";
import BaseTable from "./BaseTable";
import TablePagination from "./TablePagination";

type SomeTableProps<T, G> = {
    columns: ColumnDef<T, unknown>[];
    data: { data: T[]; total: number; grouping?: any[] };
    pagination: Pagination;
    setPagination: Dispatch<SetStateAction<Pagination>>;
    sortingState?: {
        sorting: SortingState;
        setSorting: Dispatch<SetStateAction<SortingState>>;
    };
    filterState?: {
        columnFilters: ColumnFiltersState;
        setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
    };
    groupingState?: {
        grouping: GroupingState;
        setGrouping: Dispatch<SetStateAction<GroupingState>>;
    };
    toggleGroupExpand?: (id: number) => void;
};

export default function DataTable<T, G>({
    columns,
    data,
    pagination,
    setPagination,
    sortingState,
    filterState,
    groupingState,
    toggleGroupExpand,
}: SomeTableProps<T, G>) {
    const table = useReactTable({
        data: data.data,
        columns,
        pageCount: data ? Math.ceil(data.total / pagination.pageSize) : -1,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination,
            sorting: sortingState?.sorting,
            grouping: groupingState?.grouping,
            columnFilters: filterState?.columnFilters,
        },
        manualPagination: true,
        manualSorting: sortingState !== undefined ? true : undefined,
        manualFiltering: filterState !== undefined ? true : undefined,
        manualGrouping: groupingState !== undefined ? true : undefined,
        getExpandedRowModel: getExpandedRowModel(),
        onGroupingChange: groupingState?.setGrouping,
        sortDescFirst: false,
        enableColumnResizing: true,
        onPaginationChange: setPagination,
        onSortingChange: sortingState?.setSorting,
        onColumnFiltersChange: (filter) => {
            setPagination({ ...pagination, pageIndex: 0 });
            if (filterState) {
                filterState.setColumnFilters(filter);
            }
        },
    });

    return (
        <>
            <BaseTable
                table={table}
                groups={data.grouping}
                toggleGroupExpand={toggleGroupExpand}
            />
            <TablePagination table={table} />
        </>
    );
}
