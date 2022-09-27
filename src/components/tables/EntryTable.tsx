import {
    ColumnDef,
    ColumnFiltersState,
    GroupingState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
    Ordering,
    EntryFields,
    EntryFilterOptions,
    useGetEntriesQuery,
    Entry,
    useGetEntryGroupsQuery,
    EntryGroupFields,
    EntryGroupFilterOptionsBase,
    EntryGroupOptions,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import EntryForm from "../forms/EntryForm";

type T = Entry;
type TFields = EntryFields;
type TFilterOptions = EntryFilterOptions;

export default function EntryTable() {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState<T[]>([]);

    const { pagination, setPagination } = usePagination();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    // const [grouping, setGrouping] = useState<GroupingState>([]);
    const [grouping, setGrouping] = useState<GroupingState>(["cell_name"]);

    const [groups, setGroups] = useState<any[]>([]);

    const [nekaj, setN] = useState(false);

    const { data, refetch } = useGetEntriesQuery(
        { endpoint: "http://localhost:8000/graphiql" },
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
            },
        },
        {
            queryKey: ["getEntries", pagination, sorting, columnFilters],
            keepPreviousData: true,
        }
    );

    const { data: entryGroupData, refetch: refetchEntryGroupData } =
        useGetEntryGroupsQuery(
            { endpoint: "http://localhost:8000/graphiql" },
            {
                fetchOptions: {
                    id: {},
                    limit: 100,
                    page: 1,
                    grouping: EntryGroupOptions.Cell,
                    ordering: sorting[0]
                        ? {
                              order: !sorting[0].desc
                                  ? Ordering.Asc
                                  : Ordering.Desc,
                              orderBy:
                                  sorting[0].id.toUpperCase() as EntryGroupFields,
                          }
                        : undefined,
                    filters:
                        columnFilters.length > 0
                            ? columnFilters.map((filter) => {
                                  return {
                                      value: filter.value,
                                      field: filter.id.toUpperCase() as EntryGroupFields,
                                  } as EntryGroupFilterOptionsBase;
                              })
                            : undefined,
                },
            },
            {
                queryKey: ["getEntryGroups"],
                keepPreviousData: true,
            }
        );

    useEffect(() => {
        if (entryGroupData?.getEntryGroups.results) {
            setGroups([
                ...entryGroupData.getEntryGroups.results.map((res) => ({
                    id: res.id,
                    name: res.name,
                    groupBy: EntryGroupOptions.Cell,
                    isExpanded: true,
                })),
            ]);
        }
    }, [entryGroupData]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "cellCulturePair.cell.name",
                cell: (info) => info.getValue(),
                header: t("cell.name").toString(),
                id: "cell_name",
            },
            {
                accessorKey: "cellCulturePair.culture.name",
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
                    new Date(info.getValue() as Date).toLocaleDateString(),
                header: t("entry.date").toString(),
                enableColumnFilter: false,
            },
            {
                accessorKey: "weight",
                cell: (info) => info.getValue(),
                header: t("entry.weight").toString(),
                enableColumnFilter: false,
            },
        ],
        [t]
    );

    const total = useMemo<number>(() => {
        return data?.entries.total ?? -1;
    }, [data]);

    const onSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (data?.entries.results) {
            setTableData([
                ...data.entries.results.slice(0, pagination.pageSize - 1),
            ]);
        }
    }, [data, pagination.pageSize]);

    const toggleExpand = useCallback(
        (id: number) => {
            setGroups((old) => {
                const chosenGroup = old.find((group) => group.id === id);
                if (chosenGroup !== -1) {
                    chosenGroup.isExpanded = !chosenGroup.isExpanded;
                }
                return [...old];
            });
        },
        [setGroups]
    );

    return (
        <Card className="p-2 shadow">
            <EntryForm onSuccess={onSuccess} />
            <DataTable
                columns={columns}
                data={{
                    data: tableData,
                    total,
                    grouping: groups,
                }}
                pagination={pagination}
                setPagination={setPagination}
                sortingState={{ sorting, setSorting }}
                filterState={{ columnFilters, setColumnFilters }}
                groupingState={{ grouping, setGrouping }}
                toggleGroupExpand={toggleExpand}
            />
        </Card>
    );
}
