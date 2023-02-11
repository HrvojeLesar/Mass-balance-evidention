import { Box, Table as MantineTable, TextInput } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { Column, flexRender, Table } from "@tanstack/react-table";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
    IoMdArrowDropup,
    IoMdArrowDropdown,
    IoMdArrowDropright,
} from "react-icons/io";
import { DEBOUNCE_TIME } from "./forms/FormUtils";

type FilterProps<T> = {
    table: Table<T>;
    column: Column<T, unknown>;
};

function Filter<T>({ column, table }: FilterProps<T>) {
    const [value, setValue] = useDebouncedState("", DEBOUNCE_TIME);

    useEffect(() => {
        column.setFilterValue(value);
    }, [value, column]);

    return (
        <TextInput
            onClick={(e) => {
                e.stopPropagation();
            }}
            defaultValue={""}
            placeholder={column.columnDef.header?.toString()}
            onChange={(e) => {
                setValue(e?.currentTarget.value);
            }}
            autoComplete="off"
            spellCheck={false}
            size="sm"
        />
    );
}

type BaseTableProps<T> = {
    dataLoadingState: {
        isInitialLoading: boolean;
        // isLoading?: boolean;
        // isFetching?: boolean;
    };
    table: Table<T>;
};

export default function BaseTable<T>({
    table,
    dataLoadingState,
}: BaseTableProps<T>) {
    const { t } = useTranslation();
    return (
        <Box
            sx={(t) => ({
                marginBottom: t.spacing.lg,
                overflow: "auto",
            })}
        >
            <MantineTable highlightOnHover withBorder withColumnBorders>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="text-center table-header align-middle"
                                    onClick={
                                        header.column.getCanSort()
                                            ? () => {
                                                  header.column.toggleSorting();
                                              }
                                            : undefined
                                    }
                                    style={
                                        header.id === "edit"
                                            ? { width: header.getSize() }
                                            : undefined
                                    }
                                >
                                    {header.isPlaceholder ? null : (
                                        <div className="d-flex flex-column">
                                            <div className="d-flex flex-row justify-content-center">
                                                <div>
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext()
                                                    )}
                                                </div>
                                                {header.column.getCanSort() ===
                                                false
                                                    ? null
                                                    : {
                                                          asc: (
                                                              <IoMdArrowDropup
                                                                  size={28}
                                                              />
                                                          ),
                                                          desc: (
                                                              <IoMdArrowDropdown
                                                                  size={28}
                                                              />
                                                          ),
                                                      }[
                                                          header.column.getIsSorted() as string
                                                      ] ?? (
                                                          <IoMdArrowDropup
                                                              size={28}
                                                              color="gray"
                                                          />
                                                      )}
                                            </div>
                                            {header.column.getCanFilter() && (
                                                <Filter
                                                    column={header.column}
                                                    table={table}
                                                />
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {dataLoadingState.isInitialLoading === false ? (
                        table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={
                                                cell.getIsGrouped()
                                                    ? "bg-info bg-opacity-75 align-middle"
                                                    : cell.getIsAggregated()
                                                    ? "bg-warning bg-opacity-50 align-middle"
                                                    : cell.getIsPlaceholder()
                                                    ? "bg-danger bg-opacity-50 align-middle"
                                                    : "align-middle"
                                            }
                                        >
                                            {cell.getIsGrouped() ? (
                                                <div
                                                    onClick={row.getToggleExpandedHandler()}
                                                    className="expand-cell"
                                                >
                                                    {row.getIsExpanded() ? (
                                                        <IoMdArrowDropdown
                                                            size={28}
                                                        />
                                                    ) : (
                                                        <IoMdArrowDropright
                                                            size={28}
                                                        />
                                                    )}
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext()
                                                    )}
                                                    {` (${row.subRows.length})`}
                                                </div>
                                            ) : cell.getIsAggregated() ? (
                                                flexRender(
                                                    cell.column.columnDef
                                                        .aggregatedCell ??
                                                        cell.column.columnDef
                                                            .cell,
                                                    cell.getContext()
                                                )
                                            ) : cell.getIsPlaceholder() ? null : (
                                                flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        table.getHeaderGroups().at(0)?.headers
                                            .length ?? 10
                                    }
                                    className="text-center h5"
                                >
                                    {t("table.noData")}
                                </td>
                            </tr>
                        )
                    ) : (
                        <tr>
                            <td
                                colSpan={
                                    table.getHeaderGroups().at(0)?.headers
                                        .length ?? 10
                                }
                                className="text-center h5"
                            >
                                {t("loading")}
                            </td>
                        </tr>
                    )}
                </tbody>
            </MantineTable>
        </Box>
    );
}
