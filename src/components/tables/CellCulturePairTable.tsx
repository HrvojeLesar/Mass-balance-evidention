import {
    ColumnDef,
    ColumnFiltersState,
    GroupingState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Card, Form } from "react-bootstrap";
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

    const { data, refetch, isInitialLoading } = useGetAllCellCulturePairsQuery(
        {
            options: {
                id: undefined,
                dataGroupId: dataGroupContextValue.selectedGroup,
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
                                id: {
                                    idCell: selectedCellCulturePair.cell.id,
                                    idCulture:
                                        selectedCellCulturePair.culture.id,
                                    dGroup:
                                        dataGroupContextValue.selectedGroup ??
                                        1,
                                },
                            },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <div className="h5 mb-1">
                    {t("titles.cellCulturePairInsertable").toString()}
                </div>
            ) : (
                <div className="h5 mb-1">
                    {t("titles.cellCulturePair").toString()}
                </div>
            )}
            <div className="divider"></div>
            {isInsertable && (
                <>
                    <CellCulturePairForm onInsertSuccess={onSuccess} />
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
