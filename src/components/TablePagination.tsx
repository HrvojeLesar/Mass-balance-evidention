import { Pagination } from "@mantine/core";
import { Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";

type TablePaginationProps<T> = {
    table: Table<T>;
};

export default function TablePagination<T>({ table }: TablePaginationProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = table.getPageCount();

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            table.setPageIndex(totalPages - 1);
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages, table]);

    return (
        <Pagination
            total={totalPages}
            siblings={1}
            page={currentPage}
            onChange={(page) => {
                table.setPageIndex(page - 1);
                setCurrentPage(page);
            }}
        />
    );
}
