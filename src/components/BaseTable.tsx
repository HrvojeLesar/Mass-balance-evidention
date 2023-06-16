import {
    Box,
    Checkbox,
    createStyles,
    Flex,
    NativeSelect,
    NumberInput,
    Table as MantineTable,
    TextInput,
} from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";
import { useDebouncedState } from "@mantine/hooks";
import { Column, flexRender, Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { TFunction, useTranslation } from "react-i18next";

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
        cursor: "pointer",
    },

    iconAlignment: {
        verticalAlign: "middle",
    },
    rightSectionFilterWidth: {
        width: "40%",
    },
}));

export enum ColumnFilterType {
    String,
    Number,
    Date,
}

export type ColumnFilter = {
    type: ColumnFilterType;
};

type FilterProps<T> = {
    table: Table<T>;
    column: Column<T, unknown>;
};

function TextFilter<T>({ column }: FilterProps<T>) {
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

export enum Comparators {
    Eq = "EQ",
    Ne = "NE",
    Gt = "GT",
    Gte = "GTE",
    Lt = "LT",
    Lte = "LTE",
}

const localize_date_comparator_select = (
    t: TFunction<"translation", undefined>
) => {
    return [
        { value: Comparators.Eq, label: t("comparator.date_equal") },
        { value: Comparators.Ne, label: t("comparator.date_not_equal") },
        { value: Comparators.Gt, label: t("comparator.date_greater_than") },
        {
            value: Comparators.Gte,
            label: t("comparator.date_greater_or_equal_than"),
        },
        { value: Comparators.Lt, label: t("comparator.date_less_than") },
        {
            value: Comparators.Lte,
            label: t("comparator.date_less_or_equal_than"),
        },
    ];
};

const localize_comparator_select = (t: TFunction<"translation", undefined>) => {
    return [
        { value: Comparators.Eq, label: t("comparator.equal") },
        { value: Comparators.Ne, label: t("comparator.not_equal") },
        { value: Comparators.Gt, label: t("comparator.greater_than") },
        {
            value: Comparators.Gte,
            label: t("comparator.greater_or_equal_than"),
        },
        { value: Comparators.Lt, label: t("comparator.less_than") },
        { value: Comparators.Lte, label: t("comparator.less_or_equal_than") },
    ];
};

export type DateFilterValues = {
    value: [Date, Date] | Date | null;
    comparator: Comparators | null;
    desc: ColumnFilterType.Date;
};

const DEFAULT_COMPARATOR = Comparators.Eq;

function DateFilter<T>({ column }: FilterProps<T>) {
    const { i18n, t } = useTranslation();
    const { classes } = useStyles();

    const [filterValue, setFilterValue] = useState<DateFilterValues>({
        value: null,
        comparator: DEFAULT_COMPARATOR,
        desc: ColumnFilterType.Date,
    });

    const [isRangePicker, setIsRangePicker] = useState(false);

    useEffect(() => {
        if (filterValue.value === null) {
            // WARN: Filters are extremly dumb and work only for strings
            column.setFilterValue(undefined);
        } else {
            column.setFilterValue(filterValue);
        }
    }, [column, filterValue]);

    return (
        <Flex
            align="center"
            gap="sm"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Checkbox
                onClick={() => {
                    setIsRangePicker((old) => !old);
                    setFilterValue((old) => ({
                        ...old,
                        value: null,
                    }));
                }}
            />
            {!isRangePicker ? (
                <Flex>
                    <DateInput
                        styles={{
                            input: {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            },
                        }}
                        allowDeselect={true}
                        valueFormat="DD.MM.YYYY"
                        locale={i18n.language}
                        placeholder={column.columnDef.header?.toString()}
                        onChange={(date) => {
                            setFilterValue((old) => ({
                                ...old,
                                value: date,
                            }));
                        }}
                        spellCheck={false}
                        popoverProps={{ withinPortal: true }}
                    />
                    <NativeSelect
                        styles={{
                            input: {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                            },
                        }}
                        className={classes.rightSectionFilterWidth}
                        defaultValue={DEFAULT_COMPARATOR}
                        onChange={(compValue) => {
                            setFilterValue((old) => ({
                                ...old,
                                comparator: compValue.target
                                    .value as Comparators,
                            }));
                        }}
                        data={localize_date_comparator_select(t)}
                    />
                </Flex>
            ) : (
                <DatePickerInput
                    clearable
                    type="range"
                    valueFormat="DD.MM.YYYY"
                    locale={i18n.language}
                    placeholder={column.columnDef.header?.toString()}
                    onChange={(date) => {
                        if (date[0] === null && date[1] === null) {
                            return setFilterValue((old) => ({
                                ...old,
                                comparator: null,
                                value: null,
                            }));
                        }
                        if (date[0] !== null && date[1] !== null) {
                            return setFilterValue((old) => ({
                                ...old,
                                comparator: null,
                                value: date as [Date, Date],
                            }));
                        }
                    }}
                    spellCheck={false}
                    popoverProps={{ withinPortal: true }}
                />
            )}
        </Flex>
    );
}

export type NumberFilterValues = {
    value: number | null;
    comparator: Comparators;
    desc: ColumnFilterType.Number;
};

function NumberFilter<T>({ column }: FilterProps<T>) {
    const { i18n, t } = useTranslation();
    const { classes } = useStyles();

    const [filterValue, setFilterValue] = useState<NumberFilterValues>({
        value: null,
        comparator: DEFAULT_COMPARATOR,
        desc: ColumnFilterType.Number,
    });

    useEffect(() => {
        if (filterValue.value === null) {
            // WARN: Filters are extremly dumb and work only for strings
            column.setFilterValue(undefined);
        } else {
            column.setFilterValue(filterValue);
        }
    }, [column, filterValue]);

    return (
        <Flex
            align="center"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <NumberInput
                styles={{
                    input: {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                    },
                }}
                decimalSeparator={i18n.language === "hr" ? "," : "."}
                value={filterValue.value ? filterValue.value : undefined}
                onChange={(val) => {
                    setFilterValue((old) => ({
                        ...old,
                        value: val === "" ? null : val,
                    }));
                }}
                placeholder={column.columnDef.header?.toString()}
                autoComplete="off"
                spellCheck={false}
                precision={2}
                step={0.5}
            />
            <NativeSelect
                defaultValue={DEFAULT_COMPARATOR}
                className={classes.rightSectionFilterWidth}
                styles={{
                    input: {
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                    },
                }}
                onChange={(compValue) => {
                    if (compValue) {
                        setFilterValue((old) => ({
                            ...old,
                            comparator: compValue.target.value as Comparators,
                        }));
                    }
                }}
                data={localize_comparator_select(t)}
            />
        </Flex>
    );
}

function Filter<T>({ column, table }: FilterProps<T>) {
    const columnType = column.columnDef.meta as ColumnFilter | undefined;
    if (columnType === undefined) {
        return <TextFilter column={column} table={table} />;
    }
    switch (columnType.type) {
        default:
        case ColumnFilterType.String:
            return <TextFilter column={column} table={table} />;
        case ColumnFilterType.Date:
            return <DateFilter column={column} table={table} />;
        case ColumnFilterType.Number:
            // TODO: Add configurable precision
            return <NumberFilter column={column} table={table} />;
    }
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
                                                                  className={
                                                                      classes.iconAlignment
                                                                  }
                                                                  size={28}
                                                              />
                                                          ),
                                                          desc: (
                                                              <IoMdArrowDropdown
                                                                  className={
                                                                      classes.iconAlignment
                                                                  }
                                                                  size={28}
                                                              />
                                                          ),
                                                      }[
                                                          header.column.getIsSorted() as string
                                                      ] ?? (
                                                          <IoMdArrowDropup
                                                              className={
                                                                  classes.iconAlignment
                                                              }
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
                                                            className={
                                                                classes.iconAlignment
                                                            }
                                                            size={28}
                                                        />
                                                    ) : (
                                                        <IoMdArrowDropright
                                                            className={
                                                                classes.iconAlignment
                                                            }
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
