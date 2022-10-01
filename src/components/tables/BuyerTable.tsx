import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
    Buyer,
    useGetBuyersQuery,
    Ordering,
    BuyerFields,
    BuyerFilterOptions,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import BuyerForm from "../forms/BuyerForm";
import DataTable from "../DataTable";
import { TableProps } from "./TableUtils";
import ActionButtons from "../ActionButtons";
import EditModal from "../EditModal";

type T = Buyer;
type TFields = BuyerFields;
type TFilterOptions = BuyerFilterOptions;

export default function BuyerTable({ isInsertable, isEditable }: TableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination({ pageSize: 5 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [selectedBuyer, setSelectedBuyer] = useState<T | undefined>();

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

    const columns = useMemo<ColumnDef<T>[]>(() => {
        let columns: ColumnDef<T>[] = [
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
        ];
        if (isEditable) {
            columns.push({
                id: "edit",
                enableSorting: false,
                cell: ({ row }) => {
                    return (
                        <ActionButtons
                            editFn={() => {
                                setIsModalShown(true);
                                setSelectedBuyer(row.original);
                            }}
                        />
                    );
                },
                size: 20,
            });
        }
        return columns;
    }, [t, isEditable]);

    const total = useMemo<number>(() => {
        return data?.buyers.total ?? -1;
    }, [data]);

    const onSuccess = useCallback(() => {
        refetch();
        if (isModalShown) {
            setIsModalShown(false);
        }
    }, [refetch, isModalShown, setIsModalShown]);

    useEffect(() => {
        if (data?.buyers.results) {
            setTableData([
                ...data.buyers.results.slice(0, pagination.pageSize),
            ]);
        }
    }, [data, pagination.pageSize]);

    return (
        <Card className="p-2 shadow">
            <EditModal
                title={t("titles.edit").toString()}
                show={isModalShown}
                onHide={() => setIsModalShown(false)}
            >
                <BuyerForm onUpdateSuccess={onSuccess} edit={selectedBuyer} />
            </EditModal>
            {isInsertable ? (
                <div className="h5 mb-1">
                    {t("titles.buyerInsertable").toString()}
                </div>
            ) : (
                <div className="h5 mb-1">{t("titles.buyer").toString()}</div>
            )}
            <div className="divider"></div>
            {isInsertable && (
                <>
                    <BuyerForm onInsertSuccess={onSuccess} />
                    <div className="divider"></div>
                </>
            )}
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
