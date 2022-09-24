import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
    Ordering,
    CellCulturePair,
    CellCulturePairFields,
    CellCulturePairFilterOptions,
    useGetCellCulturesPairsQuery,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import CellCulturePairForm from "../forms/CellCulturePairForm";

type T = CellCulturePair;
type TFields = CellCulturePairFields;
type TFilterOptions = CellCulturePairFilterOptions;

export default function CellCulturePairTable() {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data } = useGetCellCulturesPairsQuery(
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
            queryKey: ["getCellCulturePairs", pagination, sorting, columnFilters],
            keepPreviousData: true,
        }
    );

    const columns = useMemo<ColumnDef<T>[]>(
        () => [
            {
                accessorKey: "cell.name",
                cell: (info) => info.getValue(),
                header: t("cell.name").toString(),
            },
            {
                accessorKey: "culture.name",
                cell: (info) => info.getValue(),
                header: t("culture.name").toString(),
            },
        ],
        [t]
    );

    const total = useMemo<number>(() => {
        return data?.cellCulturePairs.total ?? -1;
    }, [data]);

    // const onSuccess = (data: InsertBuyerMutation) => {
    //     // TODO: Pagination needs to change based on added new values not
    //     // only from fetched values
    //     setBuyers([
    //         data.insertBuyer,
    //         ...buyers.slice(0, pagination.pageSize - 1),
    //     ]);
    // };

    useEffect(() => {
        if (data?.cellCulturePairs.results) {
            setTableData([
                ...data.cellCulturePairs.results.slice(0, pagination.pageSize - 1),
            ]);
        }
    }, [data, pagination.pageSize]);

    return (
        <Card className="p-2 shadow">
        <CellCulturePairForm />
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
