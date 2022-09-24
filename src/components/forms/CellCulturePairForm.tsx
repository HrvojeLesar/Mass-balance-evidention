import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Buyer,
    BuyerInsertOptions,
    Cell,
    CellFields,
    CellInsertOptions,
    Culture,
    CultureFields,
    Exact,
    GetUnpairedCellsQuery,
    GetUnpairedCulturesDocument,
    GetUnpairedCulturesQuery,
    InsertBuyerMutation,
    Ordering,
    useGetCellsQuery,
    useGetCulturesQuery,
    useGetUnpairedCellsQuery,
    useGetUnpairedCulturesQuery,
    useInsertBuyerMutation,
    useInsertCellMutation,
} from "../../generated/graphql";
import { FaSave } from "react-icons/fa";
import BaseForm from "./BaseForm";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import Select from "react-select";
import { usePagination } from "../../hooks/usePagination";

type SelectState<T> = {
    selected: T | undefined;
    limit: number;
    page: number;
    maxPage: number;
    pages: Record<number, T[]>;
    filter: string;
};

type Option<T> = {
    value: T;
    label: string;
};

const LIMIT = 10;

export default function CellCulturePairForm() {
    const { t } = useTranslation();

    const [cellSelectState, setCellSelectState] = useState<SelectState<Cell>>({
        selected: undefined,
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const [cultureSelectState, setCultureSelectState] = useState<
        SelectState<Culture>
    >({
        selected: undefined,
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const [debouncedCellInputValue, setDebouncedCellInputValue] = useState("");
    const [debouncedCultureInputValue, setDebouncedCultureInputValue] = useState("");

    const makeOptions = useCallback(
        <T extends Cell | Culture>(
            currentPage: number,
            pages: Record<number, T[]>
        ) => {
            const options: Option<T>[] = [];
            for (let i = 0; i <= currentPage; i++) {
                const results: T[] | undefined = pages[i];
                if (results) {
                    results.map((res) => {
                        options.push({
                            value: res,
                            label: res.name,
                        });
                    });
                }
            }
            return options;
        },
        []
    );

    const cellOptions = useMemo(() => {
        return makeOptions(cellSelectState.page, cellSelectState.pages);
    }, [cellSelectState.page, cellSelectState.pages]);

    const cultureOptions = useMemo(() => {
        return makeOptions(cultureSelectState.page, cultureSelectState.pages);
    }, [cultureSelectState.page, cultureSelectState.pages]);

    const { data: cellData, isFetching: isFetchingCells } =
        useGetUnpairedCellsQuery(
            { endpoint: "http://localhost:8000/graphiql" },
            {
                fetchOptions: {
                    id: { id: cultureSelectState.selected?.id ?? undefined },
                    limit: cellSelectState.limit,
                    page: cellSelectState.page,
                    ordering: {
                        order: Ordering.Asc,
                        orderBy: CellFields.Name,
                    },
                    filters:
                        cellSelectState.filter !== ""
                            ? [
                                  {
                                      value: cellSelectState.filter,
                                      field: CellFields.Name,
                                  },
                              ]
                            : undefined,
                },
            },
            {
                queryKey: [
                    "getCellsForm",
                    cellSelectState.limit,
                    cellSelectState.page,
                    cultureSelectState.selected,
                ],
                keepPreviousData: true,
            }
        );

    const { data: cultureData, isFetching: isFetchingCultures } =
        useGetUnpairedCulturesQuery(
            { endpoint: "http://localhost:8000/graphiql" },
            {
                fetchOptions: {
                    id: { id: cellSelectState.selected?.id ?? undefined },
                    limit: cultureSelectState.limit,
                    page: cultureSelectState.page,
                    ordering: {
                        order: Ordering.Asc,
                        orderBy: CultureFields.Name,
                    },
                    filters:
                        cultureSelectState.filter !== ""
                            ? [
                                  {
                                      value: cultureSelectState.filter,
                                      field: CultureFields.Name,
                                  },
                              ]
                            : undefined,
                },
            },
            {
                queryKey: [
                    "getCulturesForm",
                    cultureSelectState.limit,
                    cultureSelectState.page,
                    cellSelectState.selected,
                ],
                keepPreviousData: true,
            }
        );

    useEffect(() => {
        if (cellData) {
            setCellSelectState((old) => ({
                ...old,
                maxPage: Math.ceil(cellData.unpairedCells.total / old.limit),
                pages: {
                    ...old.pages,
                    [cellData.unpairedCells.page]:
                        cellData.unpairedCells.results,
                },
            }));
        }
    }, [cellData, setCellSelectState]);

    useEffect(() => {
        if (cultureData) {
            setCultureSelectState((old) => ({
                ...old,
                maxPage: Math.ceil(cultureData.unpairedCultures.total / old.limit),
                pages: {
                    ...old.pages,
                    [cultureData.unpairedCultures.page]:
                        cultureData.unpairedCultures.results,
                },
            }));
        }
    }, [cultureData, setCultureSelectState]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCellSelectState((old) => ({
                ...old,
                page: 1,
                filter: debouncedCellInputValue.trim(),
            }));
        }, 350);
        return () => {
            clearTimeout(timeout);
        };
    }, [debouncedCellInputValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCellSelectState((old) => ({
                ...old,
                page: 1,
                filter: debouncedCultureInputValue.trim(),
            }));
        }, 350);
        return () => {
            clearTimeout(timeout);
        };
    }, [debouncedCultureInputValue]);


    useEffect(() => {
        console.log(cellSelectState);
    }, [cellSelectState]);

    useEffect(() => {
        console.log(cultureSelectState);
    }, [cultureSelectState]);


    return (
        <BaseForm onSubmit={() => {}}>
            <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>{t("cell.name")}*</Form.Label>
                        <Select
                            options={cellOptions}
                            onMenuClose={() => {
                                setCellSelectState((old) => ({
                                    ...old,
                                    page: 1,
                                }));
                            }}
                            onMenuScrollToBottom={
                                cellSelectState.page < cellSelectState.maxPage
                                    ? () => {
                                          setCellSelectState((old) => ({
                                              ...old,
                                              page: old.page + 1,
                                          }));
                                      }
                                    : undefined
                            }
                            onInputChange={(value, actionMeta) => {
                                if (actionMeta.action === "input-change") {
                                    setDebouncedCellInputValue(value);
                                }
                            }}
                            onChange={(value, actionMeta) => {
                                if (
                                    actionMeta.action === "select-option" ||
                                    actionMeta.action === "clear"
                                ) {
                                    setCellSelectState((old) => ({
                                        ...old,
                                        selected: value?.value ?? undefined,
                                    }));
                                }
                            }}
                            isLoading={isFetchingCells}
                            isClearable
                        />
                        <Form.Control.Feedback type="invalid">
                            {t("cell.errors.name")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>{t("culture.name")}</Form.Label>
                        <Select 
                            options={cultureOptions}
                            onMenuClose={() => {
                                setCultureSelectState((old) => ({
                                    ...old,
                                    page: 1,
                                }));
                            }}
                            onMenuScrollToBottom={
                                cultureSelectState.page < cultureSelectState.maxPage
                                    ? () => {
                                          setCultureSelectState((old) => ({
                                              ...old,
                                              page: old.page + 1,
                                          }));
                                      }
                                    : undefined
                            }
                            onInputChange={(value, actionMeta) => {
                                if (actionMeta.action === "input-change") {
                                    setDebouncedCultureInputValue(value);
                                }
                            }}
                            onChange={(value, actionMeta) => {
                                if (
                                    actionMeta.action === "select-option" ||
                                    actionMeta.action === "clear"
                                ) {
                                    setCultureSelectState((old) => ({
                                        ...old,
                                        selected: value?.value ?? undefined,
                                    }));
                                }
                            }}
                            isLoading={isFetchingCultures}
                            isClearable
                        />
                    </Form.Group>
                </Col>
            </Row>
        </BaseForm>
    );
}
