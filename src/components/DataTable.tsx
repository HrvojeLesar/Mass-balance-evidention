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
    data: { data: T[]; total?: number };
    paginationState: {
        pagination: Pagination;
        setPagination: Dispatch<SetStateAction<Pagination>>;
        manual?: boolean;
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
    pageCount?: number;
};

export default function DataTable<T>({
    columns,
    data,
    paginationState,
    sortingState,
    filterState,
    groupingState,
    pageCount,
}: SomeTableProps<T>) {
    const pageCountMemo = useMemo(() => {
        if (pageCount) {
            return pageCount ?? 1;
        }

        if (paginationState.manual !== false && data && paginationState) {
            if (data.total !== undefined && data.total !== 0) {
                return Math.ceil(
                    data.total / paginationState.pagination.pageSize
                );
            } else {
                return 1;
            }
        }
    }, [data, paginationState, pageCount]);

    // // BUG: Infinite loop, rerenders when array is empty
    // useEffect(() => {
    //     if (
    //         (paginationState.manual ?? true) &&
    //         data.total !== undefined &&
    //         data.total === 0
    //     ) {
    //         paginationState.setPagination((old) => ({ ...old, pageIndex: 0 }));
    //     }
    // }, [paginationState, paginationState.setPagination, pageCountMemo, data]);

    const table = useReactTable({
        data: data.data,
        columns,
        pageCount: pageCountMemo,
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

    return (
        <>
            <BaseTable table={table} />
            <TablePagination table={table} />
        </>
    );
}
