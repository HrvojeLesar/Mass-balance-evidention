import { Divider, Flex, Select, Title } from "@mantine/core";
import {
    ColumnDef,
    ColumnFiltersState,
    GroupingState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    CellCulturePair,
    useDeleteCellCulturePairMutation,
    useGetAllCellCulturePairsQuery,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import ActionButtons from "../ActionButtons";
import DataTable from "../DataTable";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import CellCulturePairForm from "../forms/CellCulturePairForm";
import CardUtil from "../util/CardUtil";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import { TableProps } from "./TableUtils";

type T = CellCulturePair;

type SelectValue = "disabled" | "cell_name" | "culture_name";

export default function CellCulturePairTable({
    isInsertable,
    isEditable,
}: TableProps) {
    const { t } = useTranslation();

    const { pagination, setPagination } = usePagination();
    const [tableData, setTableData] = useState<T[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [selectValue, setSelectValue] = useState<SelectValue>("cell_name");

    const [groupingState, setGroupingState] = useState<GroupingState>([
        selectValue,
    ]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedCellCulturePair, setSelectedCellCulturePair] = useState<
        T | undefined
    >();

    const dataGroupContextValue = useContext(DataGroupContext);

    const { data, refetch, isInitialLoading, isFetching } =
        useGetAllCellCulturePairsQuery(
            {
                options: {
                    id: undefined,
                    dGroup: dataGroupContextValue.selectedGroup ?? -1,
                },
            },
            {
                queryKey: [
                    "getAllCellCulturePairs",
                    dataGroupContextValue.selectedGroup,
                ],
                keepPreviousData: true,
            }
        );

    useEffect(() => {
        if (data) {
            setTableData([...data.allCellCulturePairs.results]);
        }
    }, [data]);

    const columns = useMemo<ColumnDef<T>[]>(() => {
        let columns: ColumnDef<T>[] = [
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
                                setSelectedCellCulturePair(row.original);
                            }}
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
                                setSelectedCellCulturePair(row.original);
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

    const deleteCellCulturePair = useDeleteCellCulturePairMutation({
        onError: () => {
            displayOnErrorNotification(t("notificationMessages.deleteCellCulturePairMutation"));
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
                <CellCulturePairForm
                    onUpdateSuccess={onSuccess}
                    edit={selectedCellCulturePair}
                />
            </EditModal>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteCellCulturePair.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (
                        selectedCellCulturePair &&
                        selectedCellCulturePair.cell &&
                        selectedCellCulturePair.culture
                    ) {
                        deleteCellCulturePair.mutate({
                            deleteOptions: {
                                id: selectedCellCulturePair.id,
                            },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <Title order={4}>
                    {t("titles.cellCulturePairInsertable").toString()}
                </Title>
            ) : (
                <Title order={4}>
                    {t("titles.cellCulturePair").toString()}
                </Title>
            )}
            <Divider my="sm" />
            {isInsertable && (
                <>
                    <CellCulturePairForm onInsertSuccess={onSuccess} />
                    <Divider my="sm" variant="dashed" />
                </>
            )}
            <Flex mb="sm" direction="row-reverse">
                <Select
                    label={t("selectOptions.grouping").toString()}
                    value={selectValue}
                    onChange={(value: SelectValue | null) => {
                        if (value === null) {
                            return;
                        }
                        setSelectValue(value);
                        if (value === "disabled") {
                            setGroupingState([]);
                        } else {
                            setGroupingState([value]);
                        }
                    }}
                    data={[
                        {
                            value: "disabled",
                            label: t("selectOptions.disabled").toString(),
                        },
                        {
                            value: "culture_name",
                            label: t("selectOptions.culture").toString(),
                        },
                        {
                            value: "cell_name",
                            label: t("selectOptions.cell").toString(),
                        },
                    ]}
                />
            </Flex>
            <DataTable
                columns={columns}
                data={{ data: tableData }}
                paginationState={{ pagination, setPagination, manual: false }}
                sortingState={{ sorting, setSorting, manual: false }}
                filterState={{ columnFilters, setColumnFilters, manual: false }}
                groupingState={{ groupingState, setGroupingState }}
                dataLoadingState={{ isInitialLoading, isFetching }}
            />
        </CardUtil>
    );
}
