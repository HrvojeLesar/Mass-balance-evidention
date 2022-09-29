import { Column, flexRender, Table } from "@tanstack/react-table";
import { InputHTMLAttributes, useCallback, useEffect, useState } from "react";
import { Form, Table as BSTable } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import {
    IoMdArrowDropup,
    IoMdArrowDropdown,
    IoMdArrowDropright,
} from "react-icons/io";
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
            console.log("debug");
            if (
                typeof value === "string" &&
                value.trim().length < 2 &&
                value.trim().length !== 0
            ) {
                console.log("debug1");
                setIsValueTooShort(true);
            } else {
                console.log("debug2");
                if (isValueTooShort) {
                    setIsValueTooShort(false);
                }
                console.log("debug3");
                onChange(value);
            }
        }, debounce);

        return () => {
            clearTimeout(timeout);
        };
    }, [value, debounce, isValueTooShort, onChange]);

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
    const onChange = useCallback(
        (value: string | number) => {
            column.setFilterValue(value);
        },
        [column]
    );
    return (
        <DebouncedInput
            value={""}
            onChange={onChange}
            placeholder={column.columnDef.header?.toString()}
        />
    );
}

type BaseTableProps<T> = {
    table: Table<T>;
};

export default function BaseTable<T>({ table }: BaseTableProps<T>) {
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
                                    header.column.getCanSort()
                                        ? () => {
                                              header.column.toggleSorting();
                                          }
                                        : undefined
                                }
                            >
                                {header.isPlaceholder ? (
                                    <></>
                                ) : (
                                    <div className="d-flex flex-column">
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
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td
                                key={cell.id}
                                className={
                                    cell.getIsGrouped()
                                        ? "bg-info bg-opacity-75"
                                        : cell.getIsAggregated()
                                        ? "bg-warning bg-opacity-50"
                                        : cell.getIsPlaceholder()
                                        ? "bg-danger bg-opacity-50"
                                        : ""
                                }
                            >
                                {cell.getIsGrouped() ? (
                                    <div
                                        onClick={row.getToggleExpandedHandler()}
                                        className="expand-cell"
                                    >
                                        {row.getIsExpanded() ? (
                                            <IoMdArrowDropdown size={28} />
                                        ) : (
                                            <IoMdArrowDropright size={28} />
                                        )}
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                        {` (${row.subRows.length})`}
                                    </div>
                                ) : cell.getIsAggregated() ? (
                                    flexRender(
                                        cell.column.columnDef.aggregatedCell ??
                                            cell.column.columnDef.cell,
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
                ))}
            </tbody>
        </BSTable>
    );
}
