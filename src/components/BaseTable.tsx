import { Column, flexRender, Table } from "@tanstack/react-table";
import React from "react";
import { InputHTMLAttributes, useCallback, useEffect, useState } from "react";
import { Form, Table as BSTable } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import { DEBOUNCE_TIME } from "./forms/FormUtils";

type DebouncedInputPorps = {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
};

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = DEBOUNCE_TIME,
    ...props
}: DebouncedInputPorps &
    Omit<InputHTMLAttributes<HTMLImageElement>, "onChange">) {
    const [value, setValue] = useState(initialValue);
    const [isValueTooShort, setIsValueTooShort] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                typeof value === "string" &&
                value.trim().length < 2 &&
                value.trim().length !== 0
            ) {
                setIsValueTooShort(true);
            } else {
                if (isValueTooShort) {
                    setIsValueTooShort(false);
                }
                onChange(value);
            }
        }, debounce);

        return () => {
            clearTimeout(timeout);
        };
    }, [value]);

    return (
        <Form.Group
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Form.Control
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                type="input"
                placeholder={props.placeholder}
                isInvalid={isValueTooShort}
                autoComplete="off"
                size="sm"
            />
            <Form.Control.Feedback type="invalid">
                {t("search.tooShort")}
            </Form.Control.Feedback>
        </Form.Group>
    );
}

type FilterProps<T> = {
    table: Table<T>;
    column: Column<T, unknown>;
};

function Filter<T>({ column, table }: FilterProps<T>) {
    return (
        <DebouncedInput
            value={""}
            onChange={(value) => {
                column.setFilterValue(value);
            }}
            placeholder={column.columnDef.header?.toString()}
        />
    );
}

type BaseTableProps<T> = {
    table: Table<T>;
    groups?: any[];
    toggleGroupExpand?: (id: number) => void;
};

export default function BaseTable<T>({
    table,
    groups,
    toggleGroupExpand,
}: BaseTableProps<T>) {
    const drawGroupRows = useCallback(() => {
        if (groups === undefined) {
            return <></>;
        }

        const filterRows = (id: number) => {
            return table.getRowModel().rows.filter((row) => {
                return row.original.cellCulturePair.cell.id === id;
            });
        };

        const rows = () => {
            return groups.map((group) => {
                // WARN: group.id is not unique
                return (
                    <React.Fragment key={group.id}>
                        <tr key={group.id}>
                            <td
                                style={{
                                    background: "#12fc0a",
                                }}
                            >
                                <button
                                    onClick={() => {
                                        if (toggleGroupExpand) {
                                            toggleGroupExpand(group.id);
                                        }
                                    }}
                                >
                                    {group.name}
                                    {group.isExpanded ? "👇" : "👉"}
                                </button>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        {group.isExpanded &&
                            filterRows(group.id).map((row) => {
                                return (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <td key={cell.id}>
                                                    {cell.getIsPlaceholder()
                                                        ? null
                                                        : flexRender(
                                                              cell.column
                                                                  .columnDef
                                                                  .cell,
                                                              cell.getContext()
                                                          )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                    </React.Fragment>
                );
            });
        };
        return rows();
    }, [groups, table.getRowModel().rows, toggleGroupExpand]);

    return (
        <BSTable hover responsive striped bordered>
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                className="text-center table-header align-middle"
                                onClick={
                                    () => {}
                                    // header.column.getCanSort()
                                    //     ? () => {
                                    //           header.column.toggleSorting();
                                    //       }
                                    //     : undefined
                                }
                            >
                                {header.isPlaceholder ? (
                                    <></>
                                ) : (
                                    <div className="d-flex flex-column">
                                        <button
                                            {...{
                                                onClick: () => {
                                                    header.column.toggleGrouping();
                                                },
                                                style: {
                                                    cursor: "pointer",
                                                },
                                            }}
                                        >
                                            {header.column.getIsGrouped()
                                                ? `🛑(${header.column.getGroupedIndex()}) `
                                                : `👊 `}
                                        </button>
                                        <div className="d-flex flex-row justify-content-center">
                                            <div>
                                                {header.column.columnDef.header?.toString()}
                                            </div>
                                            {header.column.getIsSorted() ===
                                            false ? (
                                                <IoMdArrowDropup
                                                    size={28}
                                                    opacity={0.5}
                                                />
                                            ) : header.column.getIsSorted() ===
                                              "asc" ? (
                                                <IoMdArrowDropup size={28} />
                                            ) : (
                                                <IoMdArrowDropdown size={28} />
                                            )}
                                        </div>
                                        {header.column.getCanFilter() &&
                                            groups === undefined && (
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
                {groups === undefined &&
                    table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    style={{
                                        background: cell.getIsGrouped()
                                            ? "#12fc0a"
                                            : cell.getIsAggregated()
                                            ? "#ceef10"
                                            : cell.getIsPlaceholder()
                                            ? "#f71a16"
                                            : "white",
                                    }}
                                >
                                    {cell.getIsGrouped() ? (
                                        <button
                                            {...{
                                                onClick:
                                                    row.getToggleExpandedHandler(),
                                                style: {
                                                    cursor: row.getCanExpand()
                                                        ? "pointer"
                                                        : "normal",
                                                },
                                            }}
                                        >
                                            {row.getIsExpanded() ? "👇" : "👉"}{" "}
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                            ({row.subRows.length})
                                        </button>
                                    ) : cell.getIsAggregated() ? (
                                        <></>
                                    ) : cell.getIsPlaceholder() ? null : (
                                        flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                {drawGroupRows()}
            </tbody>
        </BSTable>
    );
}
