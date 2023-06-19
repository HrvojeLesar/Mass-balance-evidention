import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Ordering,
    DispatchNoteArticle,
    DispatchNoteArticleFields,
    useGetDispatchNotesArticlesQuery,
    useDeleteDispatchNoteArticleMutation,
    useGetDispatchNotesQuery,
    Comparator,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import { TableProps } from "./TableUtils";
import ActionButtons from "../ActionButtons";
import EditModal from "../EditModal";
import DeleteModal from "../DeleteModal";
import { DataGroupContext } from "../../DataGroupProvider";
import CardUtil from "../util/CardUtil";
import { ActionIcon, Divider, Flex, Title } from "@mantine/core";
import DispatchNoteArticleForm from "../forms/DispatchNoteArticleForm";
import DispatchNoteForm from "../forms/DisptachNoteForm";
import { FaEdit } from "react-icons/fa";
import { useToggle } from "@mantine/hooks";
import {
    ColumnFilterType,
    Comparators,
    NumberFilterValues,
} from "../BaseTable";
import moment from "moment";

type T = DispatchNoteArticle;
type TFields = DispatchNoteArticleFields;

type DispatchNoteArticleTableProps = TableProps & {
    dispatchNoteId: number;
};

export default function DispatchNoteArticleTable({
    isInsertable,
    isEditable,
    dispatchNoteId,
}: DispatchNoteArticleTableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isModalShown, setIsModalShown] = useState(false);
    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedDispatchNoteArticle, setSelectedDispatchNoteArticle] =
        useState<T | undefined>();

    const dataGroupContextValue = useContext(DataGroupContext);

    const [editToggleValue, editToggle] = useToggle();

    const { data, refetch, isInitialLoading, isFetching } =
        useGetDispatchNotesArticlesQuery(
            {
                options: {
                    id: { idDispatchNote: dispatchNoteId },
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
                                  let val;
                                  if (
                                      (
                                          filter.value as {
                                              comparator: Comparators | null;
                                          }
                                      ).comparator
                                  ) {
                                      val = filter.value as {
                                          value: [Date, Date] | Date | number;
                                          comparator: Comparators | null;
                                          desc: ColumnFilterType;
                                      };
                                  } else {
                                      val = {
                                          desc: ColumnFilterType.String,
                                          value: filter.value as string,
                                      };
                                  }
                                  return {
                                      value: {
                                          value:
                                              val.desc ===
                                                  ColumnFilterType.Number ||
                                              val.desc ===
                                                  ColumnFilterType.String
                                                  ? val.value.toString()
                                                  : val.value instanceof Date
                                                  ? new Date(
                                                        moment(
                                                            val.value
                                                        ).format("YYYY-MM-DD")
                                                    ).toJSON()
                                                  : val.value instanceof Array
                                                  ? `${new Date(
                                                        moment(
                                                            val.value[0]
                                                        ).format("YYYY-MM-DD")
                                                    ).toJSON()}, ${new Date(
                                                        moment(
                                                            val.value[1]
                                                        ).format("YYYY-MM-DD")
                                                    ).toJSON()}`
                                                  : val.value.toString(),
                                          comparator:
                                              val.comparator?.toUpperCase() as Comparator,
                                      },
                                      field: filter.id.toUpperCase() as TFields,
                                  };
                              })
                            : undefined,
                    dGroup: dataGroupContextValue.selectedGroup ?? -1,
                },
            },
            {
                queryKey: [
                    "getDispatchNoteArticles",
                    pagination,
                    sorting,
                    columnFilters,
                    dataGroupContextValue,
                ],
                keepPreviousData: true,
            }
        );

    const {
        data: dispatchNoteData,
        refetch: refetchDispatchNote,
        // isInitialLoading: isInitialLoadingDispatchNote,
    } = useGetDispatchNotesQuery(
        {
            options: {
                id: dispatchNoteId,
                dGroup: dataGroupContextValue.selectedGroup ?? -1,
            },
        },
        {
            queryKey: [
                "getDispatchNote",
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
                accessorKey: "article.name",
                cell: (info) => info.getValue(),
                header: t("article.name").toString(),
                meta: { type: ColumnFilterType.String },
            },
            {
                accessorKey: "weight_type",
                accessorFn: (row) =>
                    `${row.weightType.unit} (${row.weightType.unitShort})`,
                header: t("measureType.name").toString(),
                meta: { type: ColumnFilterType.String },
            },
            {
                accessorKey: "quantity",
                cell: (info) => info.getValue(),
                header: t("measureType.quantity").toString(),
                enableColumnFilter: true,
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
                                setSelectedDispatchNoteArticle(row.original);
                            }}
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
                                setSelectedDispatchNoteArticle(row.original);
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
        if (data?.dispatchNoteArticles.results) {
            setTableData([
                ...data.dispatchNoteArticles.results.slice(
                    0,
                    pagination.pageSize
                ),
            ]);
        }
    }, [data, pagination.pageSize]);

    const totalPages = useMemo<number | undefined>(() => {
        return data?.dispatchNoteArticles.totalPages;
    }, [data?.dispatchNoteArticles.totalPages, data?.dispatchNoteArticles]);

    const deleteDispatchNote = useDeleteDispatchNoteArticleMutation({
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
                <DispatchNoteArticleForm
                    dispatchNoteId={dispatchNoteId}
                    onUpdateSuccess={onSuccess}
                    edit={selectedDispatchNoteArticle}
                />
            </EditModal>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteDispatchNote.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedDispatchNoteArticle) {
                        deleteDispatchNote.mutate({
                            deleteOptions: {
                                id: selectedDispatchNoteArticle.id,
                            },
                        });
                    }
                }}
            />
            <Flex justify="space-between">
                <Title order={3}>
                    {t("titles.dispatchNoteArticle").toString()}
                </Title>
                <ActionIcon
                    color="yellow"
                    variant={editToggleValue ? "filled" : "outline"}
                    onClick={() => {
                        editToggle();
                    }}
                    title={t("titles.edit")}
                >
                    <FaEdit />
                </ActionIcon>
            </Flex>
            <Divider my="sm" />
            {editToggleValue &&
            dispatchNoteData &&
            dispatchNoteData?.dispatchNotes.results.length > 0 ? (
                <>
                    <DispatchNoteForm
                        onUpdateSuccess={() => {
                            refetchDispatchNote();
                        }}
                        edit={dispatchNoteData?.dispatchNotes.results[0]}
                    />
                    <Divider my="sm" variant="dashed" />
                </>
            ) : (
                <></>
            )}
            {isInsertable ? (
                <Title order={4}>
                    {t("titles.dispatchNoteInsertable").toString()}
                </Title>
            ) : (
                <Title>{t("titles.dispatchNote").toString()}</Title>
            )}
            <Divider my="sm" />
            {isInsertable && (
                <>
                    <DispatchNoteArticleForm
                        dispatchNoteId={dispatchNoteId}
                        onInsertSuccess={onSuccess}
                    />
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
