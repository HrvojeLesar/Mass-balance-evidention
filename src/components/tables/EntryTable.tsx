import { Divider, Flex, Select, Title } from "@mantine/core";
import {
    ColumnDef,
    ColumnFiltersState,
    GroupingState,
    SortingState,
} from "@tanstack/react-table";
import moment from "moment";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Entry,
    useDeleteEntryMutation,
    useGetAllEntriesQuery,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import ActionButtons from "../ActionButtons";
import {
    ColumnFilterType,
    Comparators,
    DateFilterValues,
    NumberFilterValues,
} from "../BaseTable";
import DataTable from "../DataTable";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import EntryForm from "../forms/EntryForm";
import CardUtil from "../util/CardUtil";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import { TableProps } from "./TableUtils";

type SelectValue = "disabled" | "cell_name" | "culture_name" | "buyer_name";

export default function EntryTable({ isInsertable, isEditable }: TableProps) {
    const { t, i18n } = useTranslation();

    const [tableData, setTableData] = useState<Entry[]>([]);
    const { pagination, setPagination } = usePagination({ pageSize: 20 });

    const [selectValue, setSelectValue] = useState<SelectValue>("cell_name");

    const [groupingState, setGroupingState] = useState<GroupingState>([
        selectValue,
    ]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<Entry | undefined>();

    const dataGroupContextValue = useContext(DataGroupContext);

    const { data, refetch, isInitialLoading, isFetching } =
        useGetAllEntriesQuery(
            {
                options: {
                    id: undefined,
                    dGroup: dataGroupContextValue.selectedGroup ?? -1,
                },
            },
            {
                queryKey: [
                    "getAllEntries",
                    dataGroupContextValue.selectedGroup,
                ],
                keepPreviousData: true,
            }
        );

    useEffect(() => {
        if (data) {
            setTableData([...data.allEntries.results]);
        }
    }, [data]);

    const columns = useMemo<ColumnDef<Entry>[]>(() => {
        let columns: ColumnDef<Entry>[] = [
            {
                accessorKey: "cell.name",
                cell: (info) => info.getValue(),
                header: t("cell.name").toString(),
                id: "cell_name",
            },
            {
                accessorKey: "culture.name",
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
                    moment(info.getValue<string>()).format("DD.MM.YYYY"),
                header: t("entry.date").toString(),
                enableColumnFilter: true,
                meta: { type: ColumnFilterType.Date },
                filterFn: (row, columnId, filterValue: DateFilterValues) => {
                    if (filterValue.value === null) {
                        return true;
                    }
                    const columnDate = moment(row.getValue<string>(columnId));
                    if (filterValue.value instanceof Date) {
                        const value = moment(filterValue.value);
                        switch (filterValue.comparator) {
                            case Comparators.Eq:
                                return columnDate.isSame(value, "day");
                            case Comparators.Ne:
                                return !columnDate.isSame(value, "day");
                            case Comparators.Gt:
                                return columnDate.isAfter(value, "day");
                            case Comparators.Gte:
                                return columnDate.isSameOrAfter(value, "day");
                            case Comparators.Lt:
                                return columnDate.isBefore(value, "day");
                            case Comparators.Lte:
                                return columnDate.isSameOrBefore(value, "day");
                        }
                    } else {
                        if (filterValue.value[0] && filterValue.value[1]) {
                            const firstDate = moment(filterValue.value[0]);
                            const secondDate = moment(filterValue.value[1]);
                            return columnDate.isBetween(firstDate, secondDate);
                        } else {
                            return true;
                        }
                    }
                    console.log("Is this reachable ???");
                    return true;
                },
            },
            {
                accessorKey: "weight",
                cell: (info) => {
                    if (info.getValue() !== null) {
                        return `${info
                            .getValue<number>()
                            .toLocaleString(i18n.language)} kg`;
                    }
                    return "0 kg";
                },
                header: t("entry.weight").toString(),
                enableColumnFilter: true,
                aggregationFn: "sum",
                aggregatedCell: ({ getValue }) =>
                    `Suma: ${getValue<number>().toLocaleString(
                        i18n.language
                    )} kg`,
                meta: { type: ColumnFilterType.Number },
                filterFn: (row, columnId, filterValue: NumberFilterValues) => {
                    if (filterValue.value === null) {
                        return true;
                    }
                    let number = row.getValue<number>(columnId);
                    switch (filterValue.comparator) {
                        case Comparators.Eq:
                            return number === filterValue.value;
                        case Comparators.Ne:
                            return number !== filterValue.value;
                        case Comparators.Gt:
                            return number > filterValue.value;
                        case Comparators.Gte:
                            return number >= filterValue.value;
                        case Comparators.Lt:
                            return number < filterValue.value;
                        case Comparators.Lte:
                            return number <= filterValue.value;
                    }
                },
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
                                setSelectedEntry(row.original);
                            }}
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
                                setSelectedEntry(row.original);
                            }}
                        />
                    );
                },
                size: 20,
            });
        }
        return columns;
    }, [t, isEditable, setSelectedEntry, setIsModalShown, i18n]);

    const onSuccess = useCallback(() => {
        refetch();
        if (isModalShown) {
            setIsModalShown(false);
        }
    }, [refetch, isModalShown, setIsModalShown]);

    const deleteEntry = useDeleteEntryMutation({
        onError: () => {
            displayOnErrorNotification();
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
                <EntryForm onUpdateSuccess={onSuccess} edit={selectedEntry} />
            </EditModal>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteEntry.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedEntry) {
                        deleteEntry.mutate({
                            deleteOptions: { id: selectedEntry.id },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <Title order={4}>
                    {t("titles.entryInsertable").toString()}
                </Title>
            ) : (
                <Title order={4}>{t("titles.entry").toString()}</Title>
            )}
            <Divider my="sm" />
            {isInsertable && (
                <>
                    <EntryForm onInsertSuccess={onSuccess} />
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
                        {
                            value: "buyer_name",
                            label: t("selectOptions.buyer").toString(),
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
