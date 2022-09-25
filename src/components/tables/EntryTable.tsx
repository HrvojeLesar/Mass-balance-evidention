import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
    Ordering,
    EntryFields,
    EntryFilterOptions,
    useGetEntriesQuery,
    Entry,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import EntryForm from "../forms/EntryForm";

type T = Entry;
type TFields = EntryFields;
type TFilterOptions = EntryFilterOptions;

export default function EntryTable() {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    console.log(sorting);
    const { data, refetch } = useGetEntriesQuery(
        { endpoint: "http://localhost:8000/graphiql" },
        {
            fetchOptions: {
                id: {},
                limit: pagination.pageSize,
                page: pagination.pageIndex + 1,
                ordering: sorting[0]
                    ? {
                          order: !sorting[0].desc
                              ? Ordering.Asc
                              : Ordering.Desc,
                          orderBy: sorting[0].id.toUpperCase() as TFields,
                      }
                    : undefined,
                filters:
                    columnFilters.length > 0
                        ? columnFilters.map((filter) => {
                              return {
                                  value: filter.value,
                                  field: filter.id.toUpperCase() as TFields,
                              } as TFilterOptions;
                          })
                        : undefined,
            },
        },
        {
            queryKey: ["getEntries", pagination, sorting, columnFilters],
            keepPreviousData: true,
        }
    );

    const columns = useMemo<ColumnDef<T>[]>(
        () => [
            {
                accessorKey: "cellCulturePair.cell.name",
                cell: (info) => info.getValue(),
                header: t("cell.name").toString(),
                id: "cell_name",
            },
            {
                accessorKey: "cellCulturePair.culture.name",
                cell: (info) => info.getValue(),
                header: t("culture.name").toString(),
                id: "culture_name",
            },
            {
                accessorKey: "buyer.name",
                cell: (info) => info.getValue(),
                header: t("buyer.name").toString(),
            },
            {
                accessorKey: "date",
                cell: (info) =>
                    new Date(info.getValue() as Date).toLocaleDateString(),
                header: t("entry.date").toString(),
            },
            {
                accessorKey: "weight",
                cell: (info) => info.getValue(),
                header: t("entry.weight").toString(),
            },
        ],
        [t]
    );

    const total = useMemo<number>(() => {
        return data?.entries.total ?? -1;
    }, [data]);

    const onSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (data?.entries.results) {
            setTableData([
                ...data.entries.results.slice(0, pagination.pageSize - 1),
            ]);
        }
    }, [data, pagination.pageSize]);

    return (
        <Card className="p-2 shadow">
            <EntryForm onSuccess={onSuccess} />
            <DataTable
                columns={columns}
                data={{ data: tableData, total }}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
            />
        </Card>
    );
}
