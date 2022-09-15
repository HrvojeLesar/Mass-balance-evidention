import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Buyer, useGetBuyersQuery } from "../generated/graphql";
import { LANGUAGES } from "../main";
import BuyerForm from "./forms/BuyerForm";

const columnHelper = createColumnHelper<Buyer>();

let fakeId = 46;

export default function BuyerTable() {
    const { t, i18n } = useTranslation();
    const [buyers, setBuyers] = useState<Buyer[]>([]);

    const { status, data, error, isSuccess } = useGetBuyersQuery(
        { endpoint: "http://localhost:8000/graphiql" },
        {
            fetchOptions: {},
        },
        {}
    );

    useEffect(() => {
        if (data?.buyers) {
            setBuyers([...data.buyers]);
        }
    }, [data]);

    const columns = useMemo(() => {
        return [
            columnHelper.accessor("name", {
                cell: (info) => info.getValue(),
                header: t("buyer.name").toString(),
            }),

            columnHelper.accessor("address", {
                cell: (info) => info.getValue(),
                header: "Address",
            }),

            columnHelper.accessor("contact", {
                header: "Contact",
                cell: ({ getValue, row: { index }, column: { id }, table }) => {
                    return (
                        <Form.Control
                            type="input"
                            value={getValue() ?? ""}
                            placeholder="Contact"
                        />
                    );
                },
            }),

            columnHelper.accessor("createdAt", {
                cell: (info) => info.getValue(),
                header: "Created at",
            }),
        ];
    }, [t]);

    const table = useReactTable({
        data: buyers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
    });

    return (
        <Card className="p-2 shadow">
            <BuyerForm />
            <Button
                variant="secondary"
                onClick={() => {
                    setBuyers([
                        ...buyers,
                        {
                            createdAt: "123",
                            id: fakeId++,
                            name: "FakeJon",
                        },
                    ]);
                }}
            >
                Append to buyers
            </Button>
            <Button
                variant="primary"
                onClick={() => {
                    const i = LANGUAGES.findIndex(
                        (val) => val === i18n.language
                    );
                    i18n.changeLanguage(
                        LANGUAGES[(i === -1 ? 0 : i + 1) % LANGUAGES.length]
                    );
                }}
            >
                Change language
            </Button>
            <Table hover responsive striped bordered>
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
            </Table>
            <Button
                variant="primary"
                onClick={() => {
                    table.nextPage();
                }}
            >
                {">"}
            </Button>
            <Button
                variant="primary"
                onClick={() => {
                    table.previousPage();
                }}
            >
                {"<"}
            </Button>
        </Card>
    );
}
