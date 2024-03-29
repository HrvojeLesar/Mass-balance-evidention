import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Ordering,
    WeightType,
    WeightTypeFields,
    useGetWeightTypesQuery,
    useDeleteWeightTypesMutation,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import { TableProps } from "./TableUtils";
import ActionButtons from "../ActionButtons";
import EditModal from "../EditModal";
import DeleteModal from "../DeleteModal";
import { DataGroupContext } from "../../DataGroupProvider";
import CardUtil from "../util/CardUtil";
import { Divider, Title } from "@mantine/core";
import { MbeGroupContext } from "../../MbeGroupProvider";
import WeightTypeForm from "../forms/WeightTypeForm";
import displayOnErrorNotification from "../util/deleteNotificationUtil";

type T = WeightType;
type TFields = WeightTypeFields;

export default function WeightTypeTable({
    isInsertable,
    isEditable,
}: TableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { selectedGroup: mbeGroupId } = useContext(MbeGroupContext);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedWeightType, setSelectedWeightType] = useState<
        T | undefined
    >();

    const { selectedGroup: dataGroupId } = useContext(DataGroupContext);

    const { data, refetch, isInitialLoading, isFetching } =
        useGetWeightTypesQuery(
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
                    mbeGroupId: dataGroupId ?? -1,
                },
            },
            {
                queryKey: [
                    "getWeightType",
                    pagination,
                    sorting,
                    columnFilters,
                    dataGroupId,
                ],
                keepPreviousData: true,
                enabled: dataGroupId !== undefined,
            }
        );

    const columns = useMemo<ColumnDef<T>[]>(() => {
        let columns: ColumnDef<T>[] = [
            {
                accessorKey: "unit",
                cell: (info) => info.getValue(),
                header: t("measureType.name").toString(),
            },
            {
                // TODO: Fix sorting on the backend
                accessorKey: "unit_short",
                accessorFn: (row) => row.unitShort,
                header: t("measureType.nameShort").toString(),
            },
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
                                setSelectedWeightType(row.original);
                            }}
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
                                setSelectedWeightType(row.original);
                            }}
                        />
                    );
                },
                size: 20,
            });
        }
        return columns;
    }, [t, isEditable]);

    const onSuccess = useCallback(() => {
        refetch();
        if (isModalShown) {
            setIsModalShown(false);
        }
    }, [refetch, isModalShown, setIsModalShown]);

    useEffect(() => {
        if (data?.weightTypes.results) {
            setTableData([
                ...data.weightTypes.results.slice(0, pagination.pageSize),
            ]);
        }
    }, [data, pagination.pageSize]);

    const totalPages = useMemo<number | undefined>(() => {
        return data?.weightTypes.totalPages;
    }, [data?.weightTypes]);

    const deleteWeightType = useDeleteWeightTypesMutation({
        onError: () => {
            displayOnErrorNotification(
                t("notificationMessages.deleteWeightTypeMutation")
            );
        },
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
                <WeightTypeForm
                    onUpdateSuccess={onSuccess}
                    edit={selectedWeightType}
                />
            </EditModal>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteWeightType.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedWeightType && mbeGroupId) {
                        deleteWeightType.mutate({
                            options: {
                                id: {
                                    id: selectedWeightType.id,
                                    mbeGroup: mbeGroupId,
                                },
                            },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <Title order={4}>
                    {t("titles.measureTypeInsertable").toString()}
                </Title>
            ) : (
                <Title>{t("titles.measureType").toString()}</Title>
            )}
            <Divider my="sm" />
            {isInsertable && (
                <>
                    <WeightTypeForm onInsertSuccess={onSuccess} />
                    <Divider my="sm" variant="dashed" />
                </>
            )}
            <DataTable
                columns={columns}
                data={{ data: tableData }}
                paginationState={{ pagination, setPagination, totalPages }}
                sortingState={{ sorting, setSorting }}
                filterState={{ columnFilters, setColumnFilters }}
                dataLoadingState={{ isInitialLoading, isFetching }}
            />
        </CardUtil>
    );
}
