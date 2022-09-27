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
    CultureFilterOptions,
    Culture,
    CultureFields,
    useGetCulturesQuery,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import CultureForm from "../forms/CultureForm";

type T = Culture;
type TFields = CultureFields;
type TFilterOptions = CultureFilterOptions;

export default function CultureTable() {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data, refetch } = useGetCulturesQuery(
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
            queryKey: ["getCultures", pagination, sorting, columnFilters],
            keepPreviousData: true,
        }
    );

    const columns = useMemo<ColumnDef<T>[]>(
        () => [
            {
                accessorKey: "name",
                cell: (info) => info.getValue(),
                header: t("culture.name").toString(),
            },
            {
                accessorKey: "description",
                cell: (info) => info.getValue(),
                header: t("culture.description").toString(),
            },
        ],
        [t]
    );

    const total = useMemo<number>(() => {
        return data?.cultures.total ?? -1;
    }, [data]);

    const onSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (data?.cultures.results) {
            setTableData([
                ...data.cultures.results.slice(0, pagination.pageSize - 1),
            ]);
        }
    }, [data, pagination.pageSize]);

    return (
        <Card className="p-2 shadow">
            <CultureForm onSuccess={onSuccess} />
            <DataTable
                columns={columns}
                data={{ data: tableData, total }}
                pagination={pagination}
                setPagination={setPagination}
                sortingState={{sorting, setSorting}}
                filterState={{columnFilters, setColumnFilters}}
            />
        </Card>
    );
}