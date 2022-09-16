import { Table } from "@tanstack/react-table";
import { chdir } from "process";
import { useMemo } from "react";
import { Pagination } from "react-bootstrap";

type TablePaginationProps<T> = {
    table: Table<T>;
};

const range = (start: number, end: number) => {
    {
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }
};

const SIBLINGCOUNT = 2;

export default function TablePagination<T extends {}>({
    table,
}: TablePaginationProps<T>) {
    const currentPage = useMemo(() => {
        return table.getState().pagination.pageIndex + 1;
    }, [table.getState().pagination.pageIndex]);

    const paginate = useMemo(() => {
        const totalPages = table.getPageCount();

        const totalPageNumbers = 2 * SIBLINGCOUNT + 3;
        if (totalPageNumbers >= totalPages) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - SIBLINGCOUNT, 1);
        const rightSiblingIndex = Math.min(
            currentPage + SIBLINGCOUNT,
            totalPages - 1
        );

        const shouldShowLeftDots = leftSiblingIndex > 2 + 1;
        const shouldShowRightDots = rightSiblingIndex < totalPages - (2 + 1);

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = SIBLINGCOUNT + 1 + 2;
            const leftRange = range(1, leftItemCount);

            return [
                ...leftRange,
                "...",
                ...range(totalPages - (1 - 1), totalPages),
            ];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = SIBLINGCOUNT + 1 + 2;
            const rightRange = range(totalPages - rightItemCount, totalPages);

            return [1, "...", ...rightRange];
        }

        let middleRange = range(leftSiblingIndex, rightSiblingIndex);
        return [1, "...", ...middleRange, "...", totalPages];
    }, [table.getPageCount(), currentPage]);

    return (
        <Pagination>
            <Pagination.Prev
                disabled={!table.getCanPreviousPage()}
                onClick={() => {
                    table.previousPage();
                }}
            />
            {paginate.map((item, idx) => {
                if (typeof item === "string") {
                    return <Pagination.Ellipsis key={idx} />;
                }

                return (
                    <Pagination.Item
                        key={idx}
                        onClick={() => {
                            table.setPageIndex(item - 1);
                        }}
                        active={currentPage === item}
                    >
                        {item}
                    </Pagination.Item>
                );
            })}
            <Pagination.Next
                disabled={!table.getCanNextPage()}
                onClick={() => {
                    table.nextPage();
                }}
            />
        </Pagination>
    );
}
