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
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import { TableProps } from "./TableUtils";
import ActionButtons from "../ActionButtons";
import EditModal from "../EditModal";
import DeleteModal from "../DeleteModal";
import { DataGroupContext } from "../../DataGroupProvider";
import CardUtil from "../util/CardUtil";
import { ActionIcon, Box, Divider, Flex, Title } from "@mantine/core";
import DispatchNoteArticleForm from "../forms/DispatchNoteArticleForm";
import ArticleForm from "../forms/ArticleForm";
import DispatchNoteForm from "../forms/DisptachNoteForm";
import { FaCog, FaEdit } from "react-icons/fa";
import { useToggle } from "@mantine/hooks";

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

    console.log(editToggleValue);

    const { data, refetch, isInitialLoading } =
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

    const columns = useMemo<ColumnDef<T>[]>(() => {
        let columns: ColumnDef<T>[] = [
            {
                accessorKey: "article.name",
                cell: (info) => info.getValue(),
                header: t("article.name").toString(),
            },
            {
                accessorKey: "weightType",
                cell: (info) => info.getValue(),
                header: t("measureType.name").toString(),
                id: "weight_type",
            },
            {
                accessorKey: "quantity",
                cell: (info) => info.getValue(),
                header: t("measureType.quantity").toString(),
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

    const total = useMemo<number>(() => {
        return data?.dispatchNoteArticles.totalItems ?? -1;
    }, [data]);

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
                <Title order={3}>{t("titles.dispatchNoteArticle").toString()}</Title>
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
                <Box 
                style={{
                        transition: "ease-in 1s"
                    }}>
                    <DispatchNoteForm
                        onUpdateSuccess={() => {
                            refetchDispatchNote();
                        }}
                        edit={dispatchNoteData?.dispatchNotes.results[0]}
                    />
                    <Divider my="sm" variant="dashed" />
                </Box>
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
                data={{ data: tableData, total }}
                paginationState={{ pagination, setPagination }}
                sortingState={{ sorting, setSorting }}
                filterState={{ columnFilters, setColumnFilters }}
                dataLoadingState={{ isInitialLoading }}
            />
        </CardUtil>
    );
}
