import { useQuery } from "@tanstack/react-query";
import {
    ColumnDef,
    ColumnFiltersState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    PaginationState,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Pagination, Table, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Buyer, InsertBuyerMutation, useGetBuyersQuery, OrderingOptions, Ordering, BuyerOrderBy } from "../generated/graphql";
import { usePagination } from "../hooks/usePagination";
import { LANGUAGES } from "../main";
import BaseTable from "./BaseTable";
import BuyerForm from "./forms/BuyerForm";
import TableCheckbox from "./TableCheckbox";
import TablePagination from "./TablePagination";

// const columnHelper = createColumnHelper<Buyer>();

export default function BuyerTable() {
    const { t } = useTranslation();
    const [buyers, setBuyers] = useState<Buyer[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data } = useGetBuyersQuery(
        { endpoint: "http://localhost:8000/graphiql" },
        {
            fetchOptions: {
                limit: pagination.pageSize,
                page: pagination.pageIndex + 1,
                ordering: sorting[0] ? {
                    order: !sorting[0].desc ?  Ordering.Asc : Ordering.Desc,
                    orderBy: sorting[0].id.toUpperCase() as BuyerOrderBy,
                    } : undefined,
            },
        },
        {
            queryKey: ["getBuyers", pagination, sorting],
            keepPreviousData: true,
        }
    );

    const columns = useMemo<ColumnDef<Buyer>[]>(
        () => [
            {
                accessorKey: "name",
                cell: (info) => info.getValue(),
                header: t("buyer.name").toString(),
            },
            {
                accessorKey: "address",
                cell: (info) => info.getValue(),
                header: t("buyer.address").toString(),
            },
            {
                accessorKey: "contact",
                cell: (info) => info.getValue(),
                header: t("buyer.contact").toString(),
            },
        ],
        [t]
    );

    const onSuccess = (data: InsertBuyerMutation) => {
        // TODO: Change 9 to actual dynamic value
        // TODO: Pagination needs to change based on added new values not
        // only from fetched values
        setBuyers([data.insertBuyer, ...buyers.slice(0, pagination.pageSize - 1)]);
    };

    const table = useReactTable({
        data: buyers,
        columns,
        pageCount: data
            ? Math.ceil(data.buyers.total / pagination.pageSize)
            : -1,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination,
            sorting,
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        sortDescFirst: false,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
    });

    useEffect(() => {
        if (data?.buyers.buyers) {
            setBuyers([...data.buyers.buyers.slice(0, pagination.pageSize - 1)]);
        }
    }, [data, pagination.pageSize]);

    return (
        <Card className="p-2 shadow">
            <BuyerForm onSuccess={onSuccess} />
            <BaseTable table={table} />
            <TablePagination table={table} />
        </Card>
    );
}
