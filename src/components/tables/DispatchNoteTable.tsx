import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Ordering,
    useGetDispatchNotesQuery,
    DispatchNote,
    DispatchNoteFields,
    useDeleteDispatchNoteMutation,
    Comparator,
    InsertDispatchNoteMutation,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import { TableProps } from "./TableUtils";
import ActionButtons from "../ActionButtons";
import DeleteModal from "../DeleteModal";
import { DataGroupContext } from "../../DataGroupProvider";
import CardUtil from "../util/CardUtil";
import { Divider, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { ColumnFilterType, Comparators } from "../BaseTable";
import moment from "moment";
import DispatchNoteForm from "../forms/DisptachNoteForm";

type T = DispatchNote;
type TFields = DispatchNoteFields;

export default function DispatchNoteTable({
    isInsertable,
    isEditable,
}: TableProps) {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);
    const navigate = useNavigate();

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedDispatchNote, setSelectedDispatchNote] = useState<
        T | undefined
    >();

    const dataGroupContextValue = useContext(DataGroupContext);

    const { data, refetch, isInitialLoading } = useGetDispatchNotesQuery(
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
                              const val = filter.value as {
                                  value: [Date, Date] | Date | number;
                                  comparator: Comparators | null;
                                  desc: ColumnFilterType;
                              };
                              return {
                                  value: {
                                      value:
                                          val.desc ===
                                              ColumnFilterType.Number ||
                                          val.desc === ColumnFilterType.String
                                              ? val.value.toString()
                                              : val.value instanceof Date
                                              ? new Date(
                                                    moment(val.value).format(
                                                        "YYYY-MM-DD"
                                                    )
                                                ).toJSON()
                                              : val.value instanceof Array
                                              ? `${new Date(
                                                    moment(val.value[0]).format(
                                                        "YYYY-MM-DD"
                                                    )
                                                ).toJSON()}, ${new Date(
                                                    moment(val.value[1]).format(
                                                        "YYYY-MM-DD"
                                                    )
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
                "getDispatchNotes",
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
                accessorKey: "noteType",
                accessorFn: (originalRow) =>
                    originalRow.noteType ? originalRow.noteType.toString() : "",
                cell: (info) => info.getValue(),
                header: t("dispatchNote.noteType").toString(),
                id: "note_type",
                meta: { type: ColumnFilterType.Number },
            },
            {
                accessorKey: "numericalIdentifier",
                accessorFn: (originalRow) =>
                    originalRow.numericalIdentifier
                        ? originalRow.numericalIdentifier.toString()
                        : "",
                cell: (info) => info.getValue(),
                header: t("dispatchNote.numericalIdentifier").toString(),
                id: "numerical_identifier",
                meta: { type: ColumnFilterType.Number },
            },
            {
                accessorKey: "issuingDate",
                cell: (info) =>
                    moment(info.getValue<string>()).format("DD.MM.YYYY"),
                header: t("dispatchNote.issuingDate").toString(),
                id: "issuing_date",
                meta: { type: ColumnFilterType.Date },
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
                                navigate(`/dispatch-note/${row.original.id}`);
                            }}
                            deleteFn={() => {
                                setIsDeleteModalShown(true);
                                setSelectedDispatchNote(row.original);
                            }}
                        />
                    );
                },
                size: 20,
            });
        }
        return columns;
    }, [t, isEditable, navigate]);

    const total = useMemo<number>(() => {
        return data?.dispatchNotes.totalItems ?? -1;
    }, [data]);

    const onSuccess = useCallback(
        (data: InsertDispatchNoteMutation) => {
            navigate(`/dispatch-note/${data.insertDispatchNote.id}`);
        },
        [navigate]
    );

    useEffect(() => {
        if (data?.dispatchNotes.results) {
            setTableData([
                ...data.dispatchNotes.results.slice(0, pagination.pageSize),
            ]);
        }
    }, [data, pagination.pageSize]);

    const deleteDispatchNote = useDeleteDispatchNoteMutation({
        onSuccess: () => {
            refetch();
            setIsDeleteModalShown(false);
        },
    });

    return (
        <CardUtil>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={deleteDispatchNote.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedDispatchNote) {
                        deleteDispatchNote.mutate({
                            deleteOptions: { id: selectedDispatchNote.id },
                        });
                    }
                }}
            />
            {isInsertable ? (
                <Title order={4}>{t("titles.dispatchNote").toString()}</Title>
            ) : (
                <Title>{t("titles.dispatchNote").toString()}</Title>
            )}
            {<Divider my="sm" />}
            {isInsertable && (
                <>
                    <DispatchNoteForm onInsertSuccess={onSuccess} />
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
