import { Col, Form, Row } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Buyer,
    BuyerFields,
    Cell,
    CellFields,
    Culture,
    CultureFields,
    EntryInsertOptions,
    InsertEntryMutation,
    Ordering,
    useGetBuyersQuery,
    useGetPairedCellsQuery,
    useGetPairedCulturesQuery,
    useInsertEntryMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
    DEBOUNCE_TIME,
    FormSuccessCallback,
    makeOptions,
    onChange,
    SelectOption,
    SelectState,
} from "./FormUtils";

type FormInput = {
    cell: SelectOption<Cell> | undefined;
    culture: SelectOption<Culture> | undefined;
    weight: number;
    buyer: SelectOption<Buyer> | undefined;
    date: Date;
};

const LIMIT = 10;

// TODO: Invalid cell/culture can be selected when other field is loading
export default function EntryForm({
    onSuccess,
}: FormSuccessCallback<InsertEntryMutation, EntryInsertOptions>) {
    const { t } = useTranslation();

    const {
        control,
        handleSubmit,
        setValue,
        register,
        reset,
        formState: { errors },
    } = useForm<FormInput>({
        mode: "onSubmit",
    });

    const insert = useInsertEntryMutation(
        { endpoint: "http://localhost:8000/graphiql" },
        {
            onSuccess: (data, variables, context) => {
                resetSelects();
                reset();
                onSuccess(data, variables, context);
            },
        }
    );

    const onSubmit = useCallback((data: FormInput) => {
        if (data.cell && data.culture && data.buyer) {
            insert.mutate({
                insertOptions: {
                    cellCulturePair: {
                        idCell: data.cell.value.id,
                        idCulture: data.culture.value.id,
                    },
                    date: new Date(data.date),
                    weight: Number(data.weight),
                    idBuyer: data.buyer.value.id,
                    // weightType: "kg",
                },
            });
        } else {
            console.log("Cell and culture should always be set here: ", data);
        }
    }, []);

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

    const [buyerSelectState, setBuyerSelectState] = useState<
        SelectState<Buyer>
    >({
        selected: undefined,
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const resetSelects = useCallback(() => {
        setCellSelectState((old) => ({
            ...old,
            selected: null,
        }));
        setCultureSelectState((old) => ({
            ...old,
            selected: null,
        }));
        setBuyerSelectState((old) => ({
            ...old,
            selected: null,
        }));
    }, [setCellSelectState, setCultureSelectState, setBuyerSelectState]);

    const [debouncedCellInputValue, setDebouncedCellInputValue] = useState("");
    const [debouncedCultureInputValue, setDebouncedCultureInputValue] =
        useState("");
    const [debouncedBuyerInputValue, setDebouncedBuyerInputValue] =
        useState("");

    const cellOptions = useMemo(() => {
        return makeOptions(cellSelectState.page, cellSelectState.pages);
    }, [cellSelectState.page, cellSelectState.pages]);

    const cultureOptions = useMemo(() => {
        return makeOptions(cultureSelectState.page, cultureSelectState.pages);
    }, [cultureSelectState.page, cultureSelectState.pages]);

    const buyerOptions = useMemo(() => {
        return makeOptions(buyerSelectState.page, buyerSelectState.pages);
    }, [buyerSelectState.page, buyerSelectState.pages]);

    const { data: cellData, isFetching: isFetchingCells } =
        useGetPairedCellsQuery(
            { endpoint: "http://localhost:8000/graphiql" },
            {
                fetchOptions: {
                    id: {
                        id: cultureSelectState.selected?.value.id ?? undefined,
                    },
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
                    "getPairedCellsForm",
                    cellSelectState.limit,
                    cellSelectState.page,
                    cultureSelectState.selected,
                ],
                keepPreviousData: true,
            }
        );

    const { data: cultureData, isFetching: isFetchingCultures } =
        useGetPairedCulturesQuery(
            { endpoint: "http://localhost:8000/graphiql" },
            {
                fetchOptions: {
                    id: { id: cellSelectState.selected?.value.id ?? undefined },
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
                    "getPairedCulturesForm",
                    cultureSelectState.limit,
                    cultureSelectState.page,
                    cellSelectState.selected,
                ],
                keepPreviousData: true,
            }
        );

    const { data: buyerData, isFetching: isFetchingBuyers } = useGetBuyersQuery(
        { endpoint: "http://localhost:8000/graphiql" },
        {
            fetchOptions: {
                id: {},
                limit: buyerSelectState.limit,
                page: buyerSelectState.page,
                ordering: {
                    order: Ordering.Asc,
                    orderBy: BuyerFields.Name,
                },
                filters:
                    buyerSelectState.filter !== ""
                        ? [
                              {
                                  value: buyerSelectState.filter,
                                  field: BuyerFields.Name,
                              },
                          ]
                        : undefined,
            },
        },
        {
            queryKey: [
                "getBuyersForm",
                buyerSelectState.limit,
                buyerSelectState.page,
            ],
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        if (cellData) {
            setCellSelectState((old) => ({
                ...old,
                maxPage: Math.ceil(cellData.pairedCells.total / old.limit),
                pages: {
                    ...old.pages,
                    [cellData.pairedCells.page]: cellData.pairedCells.results,
                },
            }));
        }
    }, [cellData, setCellSelectState]);

    useEffect(() => {
        if (cultureData) {
            setCultureSelectState((old) => ({
                ...old,
                maxPage: Math.ceil(
                    cultureData.pairedCultures.total / old.limit
                ),
                pages: {
                    ...old.pages,
                    [cultureData.pairedCultures.page]:
                        cultureData.pairedCultures.results,
                },
            }));
        }
    }, [cultureData, setCultureSelectState]);

    useEffect(() => {
        if (buyerData) {
            setBuyerSelectState((old) => ({
                ...old,
                maxPage: Math.ceil(buyerData.buyers.total / old.limit),
                pages: {
                    ...old.pages,
                    [buyerData.buyers.page]: buyerData.buyers.results,
                },
            }));
        }
    }, [buyerData, setBuyerSelectState]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCellSelectState((old) => ({
                ...old,
                page: 1,
                filter: debouncedCellInputValue.trim(),
            }));
        }, DEBOUNCE_TIME);
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
        }, DEBOUNCE_TIME);
        return () => {
            clearTimeout(timeout);
        };
    }, [debouncedCultureInputValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setBuyerSelectState((old) => ({
                ...old,
                page: 1,
                filter: debouncedBuyerInputValue.trim(),
            }));
        }, DEBOUNCE_TIME);
        return () => {
            clearTimeout(timeout);
        };
    }, [debouncedBuyerInputValue]);

    return (
        <BaseForm onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>{t("culture.name")}*</Form.Label>
                        <Controller
                            name="culture"
                            control={control}
                            rules={{ required: t("culture.errors.name") }}
                            render={() => (
                                <Select
                                    placeholder={t("culture.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    className={
                                        errors.culture
                                            ? "is-invalid"
                                            : undefined
                                    }
                                    value={cultureSelectState.selected}
                                    options={cultureOptions}
                                    onMenuClose={() => {
                                        setCultureSelectState((old) => ({
                                            ...old,
                                            page: 1,
                                        }));
                                    }}
                                    onMenuScrollToBottom={
                                        cultureSelectState.page <
                                        cultureSelectState.maxPage
                                            ? () => {
                                                  setCultureSelectState(
                                                      (old) => ({
                                                          ...old,
                                                          page: old.page + 1,
                                                      })
                                                  );
                                              }
                                            : undefined
                                    }
                                    onInputChange={(value, actionMeta) => {
                                        if (
                                            actionMeta.action === "input-change"
                                        ) {
                                            setDebouncedCultureInputValue(
                                                value
                                            );
                                        }
                                    }}
                                    onChange={(value, actionMeta) => {
                                        onChange(
                                            value,
                                            actionMeta,
                                            setCultureSelectState
                                        );
                                        setValue(
                                            "culture",
                                            value ?? undefined,
                                            { shouldValidate: true }
                                        );
                                        if (actionMeta.action === "clear") {
                                            setCellSelectState((old) => ({
                                                ...old,
                                                filter: "",
                                                selected: null,
                                            }));
                                        }
                                    }}
                                    isLoading={isFetchingCultures}
                                    isClearable
                                />
                            )}
                        />
                        <div className="invalid-feedback">
                            {t("culture.errors.name")}
                        </div>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>{t("cell.name")}*</Form.Label>
                        <Controller
                            name="cell"
                            control={control}
                            rules={{ required: t("cell.errors.name") }}
                            render={() => (
                                <Select
                                    placeholder={t("cell.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    className={
                                        errors.cell ? "is-invalid" : undefined
                                    }
                                    value={cellSelectState.selected}
                                    options={cellOptions}
                                    onMenuClose={() => {
                                        setCellSelectState((old) => ({
                                            ...old,
                                            page: 1,
                                        }));
                                    }}
                                    onMenuScrollToBottom={
                                        cellSelectState.page <
                                        cellSelectState.maxPage
                                            ? () => {
                                                  setCellSelectState((old) => ({
                                                      ...old,
                                                      page: old.page + 1,
                                                  }));
                                              }
                                            : undefined
                                    }
                                    onInputChange={(value, actionMeta) => {
                                        if (
                                            actionMeta.action === "input-change"
                                        ) {
                                            setDebouncedCellInputValue(value);
                                        }
                                    }}
                                    onChange={(value, actionMeta) => {
                                        onChange(
                                            value,
                                            actionMeta,
                                            setCellSelectState
                                        );
                                        setValue("cell", value ?? undefined, {
                                            shouldValidate: true,
                                        });
                                    }}
                                    isLoading={isFetchingCells}
                                    isClearable
                                />
                            )}
                        />
                        <div className="invalid-feedback">
                            {t("cell.errors.name")}
                        </div>
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>{t("entry.weight")}*</Form.Label>
                        <Form.Control
                            {...register("weight", {
                                required: t("weight.errors.name"),
                            })}
                            type="number"
                            step="any"
                            placeholder={t("entry.weight")}
                            autoComplete="off"
                            isInvalid={errors.weight !== undefined}
                        />
                        <Form.Control.Feedback type="invalid">
                            {t("weight.errors.name")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>{t("buyer.name")}*</Form.Label>
                        <Controller
                            name="buyer"
                            control={control}
                            rules={{ required: t("buyer.errors.name") }}
                            render={() => (
                                <Select
                                    placeholder={t("buyer.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    className={
                                        errors.buyer ? "is-invalid" : undefined
                                    }
                                    value={buyerSelectState.selected}
                                    options={buyerOptions}
                                    onMenuClose={() => {
                                        setBuyerSelectState((old) => ({
                                            ...old,
                                            page: 1,
                                        }));
                                    }}
                                    onMenuScrollToBottom={
                                        buyerSelectState.page <
                                        buyerSelectState.maxPage
                                            ? () => {
                                                  setBuyerSelectState(
                                                      (old) => ({
                                                          ...old,
                                                          page: old.page + 1,
                                                      })
                                                  );
                                              }
                                            : undefined
                                    }
                                    onInputChange={(value, actionMeta) => {
                                        if (
                                            actionMeta.action === "input-change"
                                        ) {
                                            setDebouncedBuyerInputValue(value);
                                        }
                                    }}
                                    onChange={(value, actionMeta) => {
                                        onChange(
                                            value,
                                            actionMeta,
                                            setBuyerSelectState
                                        );
                                        setValue("buyer", value ?? undefined, {
                                            shouldValidate: true,
                                        });
                                    }}
                                    isLoading={isFetchingBuyers}
                                    isClearable
                                />
                            )}
                        />
                        <div className="invalid-feedback">
                            {t("buyer.errors.name")}
                        </div>
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>{t("entry.date")}*</Form.Label>
                        <Form.Control
                            {...register("date", {
                                required: t("date.errors.name"),
                            })}
                            type="date"
                            placeholder={t("entry.date")}
                            autoComplete="off"
                            isInvalid={errors.date !== undefined}
                        />
                        <Form.Control.Feedback type="invalid">
                            {t("date.errors.name")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </BaseForm>
    );
}
