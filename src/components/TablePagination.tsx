import { Pagination } from "@mantine/core";
import { Table } from "@tanstack/react-table";
import { useEffect } from "react";

type TablePaginationProps<T> = {
    table: Table<T>;
};

export default function TablePagination<T>({ table }: TablePaginationProps<T>) {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();

    return (
        <Pagination
            value={totalPages < currentPage ? totalPages : currentPage}
            total={totalPages}
            siblings={1}
            onChange={(page) => {
                table.setPageIndex(page - 1);
            }}
        />
    );
}
