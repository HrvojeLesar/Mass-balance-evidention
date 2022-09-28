import {
    ColumnDef,
    ColumnFiltersState,
    GroupingState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Entry, useGetAllEntriesQuery } from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
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

    const { data, refetch } = useGetAllEntriesQuery(
        {
            fetchOptions: {
                id: {},
            },
        },
        {
            queryKey: ["getAllEntries"],
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        if (data) {
            setTableData([...data.getAllEntries.results]);
        }
    }, [data]);

    const columns = useMemo<ColumnDef<Entry>[]>(
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
        ],
        [t]
    );

    const onSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <Card className="p-2 shadow">
            {isInsertable && <EntryForm onSuccess={onSuccess} />}
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
            />
        </Card>
    );
}
