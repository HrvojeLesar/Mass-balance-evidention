import {
    Box,
    createStyles,
    Flex,
    Table as MantineTable,
    TextInput,
} from "@mantine/core";
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

const useStyles = createStyles((theme) => ({
    centerLoadingOrNoData: {
        textAlign: "center",
        fontWeight: "bold",
    },
    tableHeader: {
        "&:hover": {
            cursor: "pointer",
            userSelect: "none",
            msUserSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            backgroundColor: theme.colors.gray[1],
            color: theme.colors.gray[9],
        },
    },

    expandCell: {
        "&:hover": {
            cursor: "pointer",
            userSelect: "none",
            msUserSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
        },
    },
}));

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
    const { classes } = useStyles();
    return (
        <Box
            sx={(t) => ({
                marginBottom: t.spacing.lg,
                overflow: "auto",
            })}
        >
            <MantineTable highlightOnHover withBorder withColumnBorders striped>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={classes.tableHeader}
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
                                        <Flex direction="column">
                                            <Flex justify="center">
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
                                            </Flex>
                                            {header.column.getCanFilter() && (
                                                <Filter
                                                    column={header.column}
                                                    table={table}
                                                />
                                            )}
                                        </Flex>
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
                                        <td key={cell.id}>
                                            {cell.getIsGrouped() ? (
                                                <div
                                                    onClick={row.getToggleExpandedHandler()}
                                                    className={
                                                        classes.expandCell
                                                    }
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
                                    className={classes.centerLoadingOrNoData}
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
                                className={classes.centerLoadingOrNoData}
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
