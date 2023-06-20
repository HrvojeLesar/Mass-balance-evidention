import { Divider, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Ordering,
    useGetCellsQuery,
    CellFields,
    Cell,
    useDeleteCellMutation,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import ActionButtons from "../ActionButtons";
import DataTable from "../DataTable";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import CellForm from "../forms/CellForm";
import CardUtil from "../util/CardUtil";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import { TableProps } from "./TableUtils";

type T = Cell;
type TFields = CellFields;

export default function CellTable({ isInsertable, isEditable }: TableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedCell, setSelectedCell] = useState<T | undefined>();

    const dataGroupContextValue = useContext(DataGroupContext);

    const { data, refetch, isInitialLoading, isFetching } = useGetCellsQuery(
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
                dGroup: dataGroupContextValue.selectedGroup ?? -1,
            },
        },
        {
            queryKey: [
                "getCells",
                pagination,
                sorting,
                columnFilters,
                dataGroupContextValue.selectedGroup,
            ],
            keepPreviousData: true,
        }
    );

    const columns = useMemo<ColumnDef<T>[]>(() => {
        let columns: ColumnDef<T>[] = [
            {
                accessorKey: "name",
                cell: (info) => info.getValue(),
                header: t("cell.name").toString(),
            },
            // {
            //     accessorKey: "description",
            //     cell: (info) => info.getValue(),
            //     header: t("cell.description").toString(),
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
                                setSelectedCell(row.original);
                            }}
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
                                setSelectedCell(row.original);
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
        if (data?.cells.results) {
            setTableData([...data.cells.results.slice(0, pagination.pageSize)]);
        }
    }, [data, pagination.pageSize]);

    const totalPages = useMemo<number | undefined>(() => {
        return data?.cells.totalPages;
    }, [data?.cells]);

    const deleteCell = useDeleteCellMutation({
        onError: () => {
            displayOnErrorNotification(t("notificationMessages.cellDeleteError"));
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
                <CellForm onUpdateSuccess={onSuccess} edit={selectedCell} />
            </EditModal>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteCell.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedCell) {
                        deleteCell.mutate({
                            deleteOptions: { id: selectedCell.id },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <Title order={4}>{t("titles.cellInsertable").toString()}</Title>
            ) : (
                <Title order={4}>{t("titles.cell").toString()}</Title>
            )}
            <Divider my="sm" />
            {isInsertable && (
                <>
                    <CellForm onInsertSuccess={onSuccess} />
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
