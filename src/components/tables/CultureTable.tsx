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
    CultureFilterOptions,
    Culture,
    CultureFields,
    useGetCulturesQuery,
    useDeleteCultureMutation,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import ActionButtons from "../ActionButtons";
import DataTable from "../DataTable";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import CultureForm from "../forms/CultureForm";
import { TableProps } from "./TableUtils";

type T = Culture;
type TFields = CultureFields;
type TFilterOptions = CultureFilterOptions;

export default function CultureTable({ isInsertable, isEditable }: TableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedCulture, setSelectedCulture] = useState<T | undefined>();

    const dataGroupContextValue = useContext(DataGroupContext);

    const { data, refetch, isInitialLoading } = useGetCulturesQuery(
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
                dataGroupId: dataGroupContextValue.selectedGroup,
            },
        },
        {
            queryKey: [
                "getCultures",
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
                header: t("culture.name").toString(),
            },
            // {
            //     accessorKey: "description",
            //     cell: (info) => info.getValue(),
            //     header: t("culture.description").toString(),
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
                                setSelectedCulture(row.original);
                            }}
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
                                setSelectedCulture(row.original);
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
        return data?.cultures.total ?? -1;
    }, [data]);

    const onSuccess = useCallback(() => {
        refetch();
        if (isModalShown) {
            setIsModalShown(false);
        }
    }, [refetch, isModalShown, setIsModalShown]);

    useEffect(() => {
        if (data?.cultures.results) {
            setTableData([
                ...data.cultures.results.slice(0, pagination.pageSize),
            ]);
        }
    }, [data, pagination.pageSize]);

    const deleteCulture = useDeleteCultureMutation({
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
                <CultureForm
                    onUpdateSuccess={onSuccess}
                    edit={selectedCulture}
                />
            </EditModal>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteCulture.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedCulture) {
                        deleteCulture.mutate({
                            deleteOptions: { id: selectedCulture.id },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <div className="h5 mb-1">
                    {t("titles.cultureInsertable").toString()}
                </div>
            ) : (
                <div className="h5 mb-1">{t("titles.culture").toString()}</div>
            )}
            <div className="divider"></div>
            {isInsertable && (
                <>
                    <CultureForm onInsertSuccess={onSuccess} />
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
