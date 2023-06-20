import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getGroupedRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    GroupingState,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Pagination } from "../hooks/usePagination";
import BaseTable from "./BaseTable";
import TablePagination from "./TablePagination";

type SomeTableProps<T> = {
    columns: ColumnDef<T, unknown>[];
    data: { data: T[] };
    paginationState: {
        pagination: Pagination;
        setPagination: Dispatch<SetStateAction<Pagination>>;
        manual?: boolean;
        totalPages?: number | undefined;
    };
    sortingState?: {
        sorting: SortingState;
        setSorting: Dispatch<SetStateAction<SortingState>>;
        manual?: boolean;
    };
    filterState?: {
        columnFilters: ColumnFiltersState;
        setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
        manual?: boolean;
    };
    groupingState?: {
        groupingState: GroupingState;
        setGroupingState: Dispatch<SetStateAction<GroupingState>>;
    };
    dataLoadingState?: {
        isInitialLoading?: boolean;
        // isLoading?: boolean;
        isFetching?: boolean;
    };
};

export default function DataTable<T>({
    columns,
    data,
    paginationState,
    sortingState,
    filterState,
    groupingState,
    dataLoadingState,
}: SomeTableProps<T>) {
    const table = useReactTable({
        data: data.data,
        columns,
        pageCount: paginationState.totalPages,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination: paginationState?.pagination,
            sorting: sortingState?.sorting,
            columnFilters: filterState?.columnFilters,
            grouping: groupingState?.groupingState,
        },
        manualPagination: paginationState.manual ?? true,
        getPaginationRowModel: paginationState.manual
            ? undefined
            : getPaginationRowModel(),
        manualSorting: sortingState?.manual ?? true,
        getSortedRowModel: sortingState?.manual
            ? undefined
            : getSortedRowModel(),
        manualFiltering: filterState?.manual ?? true,
        getFilteredRowModel: filterState?.manual
            ? undefined
            : getFilteredRowModel(),
        getGroupedRowModel: groupingState?.groupingState
            ? getGroupedRowModel()
            : undefined,
        getExpandedRowModel: getExpandedRowModel(),
        sortDescFirst: false,
        enableColumnResizing: true,
        onPaginationChange: paginationState?.setPagination,
        onSortingChange: sortingState?.setSorting,
        onGroupingChange: groupingState?.setGroupingState,
        onColumnFiltersChange:
            filterState !== undefined
                ? (filter) => {
                    paginationState.setPagination({
                        ...paginationState.pagination,
                        pageIndex: 0,
                    });
                    if (filterState) {
                        filterState.setColumnFilters(filter);
                    }
                }
                : undefined,
    });

    useEffect(() => {
        const currentPage = table.getState().pagination.pageIndex + 1;
        const totalPages = table.getPageCount();
        if (totalPages < currentPage && !dataLoadingState?.isFetching) {
            table.setPageIndex(totalPages - 1);
        }
    }, [table, dataLoadingState?.isFetching]);

    return (
        <>
            <BaseTable
                table={table}
                dataLoadingState={{
                    isInitialLoading:
                        dataLoadingState?.isInitialLoading ?? false,
                    isFetching: dataLoadingState?.isFetching ?? false,
                }}
            />
            <TablePagination table={table} />
        </>
    );
}
