import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Buyer,
    useGetBuyersQuery,
    Ordering,
    BuyerFields,
    useDeleteBuyerMutation,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import BuyerForm from "../forms/BuyerForm";
import DataTable from "../DataTable";
import { TableProps } from "./TableUtils";
import ActionButtons from "../ActionButtons";
import EditModal from "../EditModal";
import DeleteModal from "../DeleteModal";
import { DataGroupContext } from "../../DataGroupProvider";
import CardUtil from "../util/CardUtil";
import { Divider, Title } from "@mantine/core";
import { ColumnFilterType } from "../BaseTable";

type T = Buyer;
type TFields = BuyerFields;

export default function BuyerTable({ isInsertable, isEditable }: TableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedBuyer, setSelectedBuyer] = useState<T | undefined>();

    const dataGroupContextValue = useContext(DataGroupContext);

    const { data, refetch, isInitialLoading } = useGetBuyersQuery(
        {
            options: {
                id: undefined,
                pageSize: pagination.pageSize,
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
                                  value: filter.value as string,
                                  field: filter.id.toUpperCase() as TFields,
                              };
                          })
                        : undefined,
                dataGroupId: dataGroupContextValue.selectedGroup,
            },
        },
        {
            queryKey: [
                "getBuyers",
                pagination,
                sorting,
                columnFilters,
                dataGroupContextValue,
            ],
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
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
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
        return data?.buyers.totalItems ?? -1;
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

    const deleteBuyer = useDeleteBuyerMutation({
        onSuccess: () => {
            refetch();
            setIsDeleteModalShown(false);
        },
    });

    return (
        <CardUtil>
            <EditModal
                title={t("titles.edit").toString()}
                show={isModalShown}
                onHide={() => setIsModalShown(false)}
            >
                <BuyerForm onUpdateSuccess={onSuccess} edit={selectedBuyer} />
            </EditModal>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteBuyer.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedBuyer) {
                        deleteBuyer.mutate({
                            deleteOptions: { id: selectedBuyer.id },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <Title order={4}>
                    {t("titles.buyerInsertable").toString()}
                </Title>
            ) : (
                <Title>{t("titles.buyer").toString()}</Title>
            )}
            <Divider my="sm" />
            {isInsertable && (
                <>
                    <BuyerForm onInsertSuccess={onSuccess} />
                    <Divider my="sm" variant="dashed" />
                </>
            )}
            <DataTable
                columns={columns}
                data={{ data: tableData, total }}
                paginationState={{ pagination, setPagination }}
                sortingState={{ sorting, setSorting }}
                filterState={{ columnFilters, setColumnFilters }}
                dataLoadingState={{ isInitialLoading }}
            />
        </CardUtil>
    );
}
