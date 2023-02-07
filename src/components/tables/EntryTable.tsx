import {
    ColumnDef,
    ColumnFiltersState,
    GroupingState,
    SortingState,
} from "@tanstack/react-table";
import moment from "moment";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Entry,
    useDeleteEntryMutation,
    useGetAllEntriesQuery,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import ActionButtons from "../ActionButtons";
import DataTable from "../DataTable";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import EntryForm from "../forms/EntryForm";
import { TableProps } from "./TableUtils";

type SelectValue = "disabled" | "cell_name" | "culture_name" | "buyer_name";

export default function EntryTable({ isInsertable, isEditable }: TableProps) {
    const { t } = useTranslation();

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

    const { data, refetch, isInitialLoading } = useGetAllEntriesQuery(
        {
            options: {
                id: undefined,
                dataGroupId: dataGroupContextValue.selectedGroup,
            },
        },
        {
            queryKey: ["getAllEntries", dataGroupContextValue.selectedGroup],
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
                enableColumnFilter: false,
            },
            {
                accessorKey: "weight",
                cell: (info) => {
                    if (info.getValue() !== null) {
                        return `${info.getValue<number>().toLocaleString()} kg`;
                    }
                    return "0 kg";
                },
                header: t("entry.weight").toString(),
                enableColumnFilter: false,
                aggregationFn: "sum",
                aggregatedCell: ({ getValue }) =>
                    `Suma: ${getValue<number>().toLocaleString()} kg`,
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
    }, [t, isEditable, setSelectedEntry, setIsModalShown]);

    const onSuccess = useCallback(() => {
        refetch();
        if (isModalShown) {
            setIsModalShown(false);
        }
    }, [refetch, isModalShown, setIsModalShown]);

    const deleteEntry = useDeleteEntryMutation({
        onSuccess: () => {
            refetch();
            setIsDeleteModalShown(false);
        },
    });

    return (
        <Card className="p-2 shadow">
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
                            options: { id: selectedEntry.id },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <div className="h5 mb-1">
                    {t("titles.entryInsertable").toString()}
                </div>
            ) : (
                <div className="h5 mb-1">{t("titles.entry").toString()}</div>
            )}
            <div className="divider"></div>
            {isInsertable && (
                <>
                    <EntryForm onInsertSuccess={onSuccess} />
                    <div className="divider"></div>
                </>
            )}
            <Form className="d-flex flex-row-reverse mb-2">
                <div>
                    <Form.Label>
                        {t("selectOptions.grouping").toString()}
                    </Form.Label>
                    <Form.Select
                        value={selectValue}
                        onChange={(e) => {
                            const value = e.target.value as SelectValue;
                            setSelectValue(value);
                            if (value === "disabled") {
                                setGroupingState([]);
                            } else {
                                setGroupingState([value]);
                            }
                        }}
                    >
                        <option value="disabled">
                            {t("selectOptions.disabled").toString()}
                        </option>
                        <option value="culture_name">
                            {t("selectOptions.culture").toString()}
                        </option>
                        <option value="cell_name">
                            {t("selectOptions.cell").toString()}
                        </option>
                        <option value="buyer_name">
                            {t("selectOptions.buyer").toString()}
                        </option>
                    </Form.Select>
                </div>
            </Form>
            <DataTable
                columns={columns}
                data={{ data: tableData }}
                paginationState={{ pagination, setPagination, manual: false }}
                sortingState={{ sorting, setSorting, manual: false }}
                filterState={{ columnFilters, setColumnFilters, manual: false }}
                groupingState={{ groupingState, setGroupingState }}
                dataLoadingState={{ isInitialLoading }}
            />
        </Card>
    );
}
