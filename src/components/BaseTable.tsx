import {
    flexRender,
    Table,
} from "@tanstack/react-table";
import { Table as BSTable } from "react-bootstrap";

type BaseTableProps<T> = {
    table: Table<T>;
};

export default function BaseTable<T>({
    table
}: BaseTableProps<T>) {

    return (
        <>
            <BSTable hover responsive striped bordered>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder ? (
                                        <></>
                                    ) : (
                                        flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )
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
        </>
    );
}
