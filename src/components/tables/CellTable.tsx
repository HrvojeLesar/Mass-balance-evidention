import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Ordering,
    useGetCellsQuery,
    CellFields,
    CellFilterOptions,
    Cell,
    useDeleteCellMutation,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import ActionButtons from "../ActionButtons";
import DataTable from "../DataTable";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import CellForm from "../forms/CellForm";
import { TableProps } from "./TableUtils";

type T = Cell;
type TFields = CellFields;
type TFilterOptions = CellFilterOptions;

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

    const { data, refetch, isInitialLoading } = useGetCellsQuery(
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
                                  value: filter.value,
                                  field: filter.id.toUpperCase() as TFields,
                              } as TFilterOptions;
                          })
                        : undefined,
                dataGroupId: dataGroupContextValue.selectedGroup,
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

    const total = useMemo<number>(() => {
        return data?.cells.totalItems ?? -1;
    }, [data]);

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

    const deleteCell = useDeleteCellMutation({
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
                            options: { id: selectedCell.id },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <div className="h5 mb-1">
                    {t("titles.cellInsertable").toString()}
                </div>
            ) : (
                <div className="h5 mb-1">{t("titles.cell").toString()}</div>
            )}
            <div className="divider"></div>
            {isInsertable && (
                <>
                    <CellForm onInsertSuccess={onSuccess} />
                    <div className="divider"></div>
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
        </Card>
    );
}
