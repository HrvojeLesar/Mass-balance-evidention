import { useState } from "react";

type PaginationParams = {
    pageIndex?: number;
    pageSize?: number;
};

export function usePagination(
    { pageIndex = 0, pageSize = 10 }: PaginationParams = {
        pageIndex: 0,
        pageSize: 10,
    }
) {
    const [pagination, setPagination] = useState({
        pageIndex,
        pageSize,
    });

    return { pagination, setPagination };
}
