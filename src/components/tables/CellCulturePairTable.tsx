import {
    ColumnDef,
    ColumnFiltersState,
    GroupingState,
    SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
    CellCulturePair,
    useGetAllCellCultureParisQuery,
} from "../../generated/graphql";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../DataTable";
import CellCulturePairForm from "../forms/CellCulturePairForm";

type T = CellCulturePair;

type SelectValue = "disabled" | "cell_name" | "culture_name";

export default function CellCulturePairTable() {
    const { t } = useTranslation();

    const { pagination, setPagination } = usePagination();
    const [tableData, setTableData] = useState<T[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [selectValue, setSelectValue] = useState<SelectValue>("cell_name");

    const [groupingState, setGroupingState] = useState<GroupingState>([
        selectValue,
    ]);

    const { data, refetch } = useGetAllCellCultureParisQuery(
        {
            fetchOptions: {
                id: {},
            },
        },
        {
            queryKey: ["getAllCellCulturePairs"],
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        if (data) {
            setTableData([...data.getAllCellCulturePairs.results]);
        }
    }, [data]);

    const columns = useMemo<ColumnDef<T>[]>(
        () => [
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
        ],
        [t]
    );

    const onSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <Card className="p-2 shadow">
            <CellCulturePairForm onSuccess={onSuccess} />
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
            />
        </Card>
    );
}
