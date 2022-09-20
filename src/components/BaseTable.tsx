import { Column, flexRender, Table } from "@tanstack/react-table";
import { InputHTMLAttributes, useEffect, useState } from "react";
import { Form, Table as BSTable } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";

type DebouncedInputPorps = {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
};

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
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
                                className="text-center table-header"
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
                            <td key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </BSTable>
    );
}
