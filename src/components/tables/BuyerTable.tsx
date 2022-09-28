import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
    Buyer,
    useGetBuyersQuery,
    Ordering,
    BuyerFields,
    BuyerFilterOptions,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import { LANGUAGES } from "../../main";
import BuyerForm from "../forms/BuyerForm";
import DataTable from "../DataTable";
import { TableProps } from "./TableUtils";

type T = Buyer;
type TFields = BuyerFields;
type TFilterOptions = BuyerFilterOptions;

export default function BuyerTable({ isInsertable, isEditable }: TableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data, refetch } = useGetBuyersQuery(
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
            queryKey: ["getBuyers", pagination, sorting, columnFilters],
            keepPreviousData: true,
        }
    );

    const columns = useMemo<ColumnDef<T>[]>(
        () => [
            {
                accessorKey: "name",
                cell: (info) => info.getValue(),
                header: t("buyer.name").toString(),
            },
            // {
            //     accessorKey: "address",
            //     cell: (info) => info.getValue(),
            //     header: t("buyer.address").toString(),
            // },
            // {
            //     accessorKey: "contact",
            //     cell: (info) => info.getValue(),
            //     header: t("buyer.contact").toString(),
            // },
        ],
        [t]
    );

    const total = useMemo<number>(() => {
        return data?.buyers.total ?? -1;
    }, [data]);

    const onSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (data?.buyers.results) {
            setTableData([
                ...data.buyers.results.slice(0, pagination.pageSize - 1),
            ]);
        }
    }, [data, pagination.pageSize]);

    return (
        <Card className="p-2 shadow">
            {isInsertable && <BuyerForm onSuccess={onSuccess} />}
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
