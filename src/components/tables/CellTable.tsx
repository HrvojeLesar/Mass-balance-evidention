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
    useGetCellsQuery,
    CellFields,
    CellFilterOptions,
    Cell,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import CellForm from "../forms/CellForm";

type T = Cell;
type TFields = CellFields;
type TFilterOptions = CellFilterOptions;

export default function CellTable() {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data, refetch } = useGetCellsQuery(
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
            queryKey: ["getCells", pagination, sorting, columnFilters],
            keepPreviousData: true,
        }
    );

    const columns = useMemo<ColumnDef<T>[]>(
        () => [
            {
                accessorKey: "name",
                cell: (info) => info.getValue(),
                header: t("cell.name").toString(),
            },
            {
                accessorKey: "description",
                cell: (info) => info.getValue(),
                header: t("cell.description").toString(),
            },
        ],
        [t]
    );

    const total = useMemo<number>(() => {
        return data?.cells.total ?? -1;
    }, [data]);

    const onSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (data?.cells.results) {
            setTableData([
                ...data.cells.results.slice(0, pagination.pageSize - 1),
            ]);
        }
    }, [data, pagination.pageSize]);

    return (
        <Card className="p-2 shadow">
            <CellForm onSuccess={onSuccess} />
            <DataTable
                columns={columns}
                data={{ data: tableData, total }}
                paginationState={{ pagination, setPagination }}
                sortingState={{ sorting, setSorting }}
                filterState={{ columnFilters, setColumnFilters }}
            />
        </Card>
    );
}
