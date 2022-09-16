import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Pagination, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Buyer, useGetBuyersQuery } from "../generated/graphql";
import { LANGUAGES } from "../main";
import BuyerForm from "./forms/BuyerForm";
import TablePagination from "./TablePagination";

const columnHelper = createColumnHelper<Buyer>();

export default function BuyerTable() {
    const { t, i18n } = useTranslation();
    const [buyers, setBuyers] = useState<Buyer[]>([]);

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

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

    const pagination = useMemo(() => {
        return {
            pageIndex,
            pageSize,
        };
    }, [pageIndex, pageSize]);

    const columns = useMemo(() => {
        return [
            columnHelper.accessor("name", {
                cell: (info) => info.getValue(),
                header: t("buyer.name").toString(),
            }),

            columnHelper.accessor("address", {
                cell: (info) => info.getValue(),
                header: t("buyer.address").toString(),
            }),

            columnHelper.accessor("contact", {
                cell: (info) => info.getValue(),
                header: t("buyer.contact").toString(),
            }),
        ];
    }, [t]);

    const table = useReactTable({
        data: buyers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
        initialState: {
            pagination: {
                pageSize: 2,
                pageIndex: 0,
            },
        },
        // TODO: pagination
        pageCount: 23,
        // state: {
        //     pagination,
        // },
        // manualPagination: true,
        // onPaginationChange: setPagination,
    });

    return (
        <Card className="p-2 shadow">
            <BuyerForm />
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
            <div>{table.getCanNextPage().toString()}</div>
            <div>{table.getCanPreviousPage().toString()}</div>
            <TablePagination table={table} />
        </Card>
    );
}
