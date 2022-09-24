import { useCallback, useState } from "react";

type PaginationParams = {
    pageIndex?: number;
    pageSize?: number;
};

export type Pagination = {
    pageIndex: number;
    pageSize: number;
};

export function usePagination(
    { pageIndex = 0, pageSize = 10 }: PaginationParams = {
        pageIndex: 0,
        pageSize: 10,
    }
) {
    const [pagination, setPagination] = useState<Pagination>({
        pageIndex,
        pageSize,
    });

    const resetPagination = useCallback(() => {
        setPagination({ pageIndex, pageSize });
    }, [pageIndex, pageSize, setPagination]);

    return { pagination, setPagination, resetPagination };
}
