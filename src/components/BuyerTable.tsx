import { useQuery } from "@tanstack/react-query";
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
import BaseTable from "./BaseTable";
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

    const pagination = useMemo(() => {
        return {
            pageIndex,
            pageSize,
        };
    }, [pageIndex, pageSize]);

    const { data } = useGetBuyersQuery(
        { endpoint: "http://localhost:8000/graphiql" },
        {
            fetchOptions: {
                limit: pageSize,
                page: pageIndex + 1,
            },
        },
        {
            queryKey: ["getBuyers", pagination],
            keepPreviousData: true,
        }
    );

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
        pageCount: data ? Math.ceil(data.buyers.total / pageSize) : -1,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination,
        },
        manualPagination: true,
        onPaginationChange: setPagination,
    });

    useEffect(() => {
        if (data?.buyers.buyers) {
            setBuyers([...data.buyers.buyers]);
        }
    }, [data]);

    return (
        <Card className="p-2 shadow">
        <div>Renders: {renderCount}</div>
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
            <BaseTable table={table}/>
            <TablePagination table={table} />
        </Card>
    );
}
