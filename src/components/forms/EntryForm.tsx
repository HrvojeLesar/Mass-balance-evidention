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
    Entry,
    EntryInsertOptions,
    EntryUpdateOptions,
    InsertEntryMutation,
    Ordering,
    UpdateEntryMutation,
    useGetBuyersQuery,
    useGetPairedCellsQuery,
    useGetPairedCulturesQuery,
    useInsertEntryMutation,
    useUpdateEntryMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
    DEBOUNCE_TIME,
    FormProps,
    makeOptions,
    onChange,
    SelectOption,
    SelectState,
    selectStyle,
} from "./FormUtils";
import moment from "moment";
import { DataGroupContext } from "../../DataGroupProvider";

type FormInput = {
    cell: SelectOption<Cell> | undefined;
    culture: SelectOption<Culture> | undefined;
    weight: number | null;
    buyer: SelectOption<Buyer> | undefined;
    date: Date | string | null;
};

const LIMIT = 10;

// TODO: Invalid cell/culture can be selected when other field is loading
export default function EntryForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    Entry,
    InsertEntryMutation,
    EntryInsertOptions,
    UpdateEntryMutation,
    EntryUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);

    const {
        control,
        handleSubmit,
        setValue,
        register,
        reset,
        getValues,
        formState: { errors },
    } = useForm<FormInput>({
        mode: "onSubmit",
        defaultValues: {
            cell: {
                value: edit?.cellCulturePair?.cell ?? undefined,
                label: edit?.cellCulturePair?.cell?.name ?? undefined,
            },
            culture: {
                value: edit?.cellCulturePair?.culture ?? undefined,
                label: edit?.cellCulturePair?.culture?.name ?? undefined,
            },
            buyer: {
                value: edit?.buyer ?? undefined,
                label: edit?.buyer?.name ?? undefined,
            },
            date:
                edit !== undefined
                    ? moment(edit.date as Date).format("YYYY-MM-DD")
                    : undefined,
            weight: edit?.weight ?? undefined,
        },
    });

    const insert = useInsertEntryMutation({
        onSuccess: (data, variables, context) => {
            // resetSelects();
            reset({ ...getValues(), date: null, weight: null });
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateEntryMutation({
        onSuccess: (data, variables, context) => {
            if (onUpdateSuccess) {
                onUpdateSuccess(data, variables, context);
            }
        },
    });

    const onInsertSubmit = useCallback(
        (data: FormInput) => {
            if (data.cell && data.culture && data.buyer && data.date) {
                insert.mutate({
                    insertOptions: {
                        cellCulturePair: {
                            idCell: data.cell.value.id,
                            idCulture: data.culture.value.id,
                            dGroup: dataGroupContextValue.selectedGroup ?? 1,
                        },
                        date: new Date(data.date),
                        weight: Number(data.weight),
                        idBuyer: data.buyer.value.id,
                        dGroup: dataGroupContextValue.selectedGroup ?? 1,
                        // weightType: "kg",
                    },
                });
            } else {
                console.log(
                    "Cell and culture should always be set here: ",
                    data
                );
            }
        },
        [insert, dataGroupContextValue.selectedGroup]
    );

    const onUpdateSubmit = useCallback(
        (data: FormInput) => {
            if (data.cell && data.culture && data.buyer && data.date && edit) {
                update.mutate({
                    updateOptions: {
                        id: edit?.id,
                        cellCulturePair: {
                            idCell: data.cell.value.id,
                            idCulture: data.culture.value.id,
                            dGroup: edit.dGroup?.id ?? 1,
                        },
                        date: new Date(data.date),
                        weight: Number(data.weight),
                        idBuyer: data.buyer.value.id,
                        // weightType: "kg",
                    },
                });
            } else {
                console.log(
                    "Cell and culture should always be set here: ",
                    data
                );
            }
        },
        [edit, update]
    );

    const [cellSelectState, setCellSelectState] = useState<SelectState<Cell>>({
        selected:
            edit === undefined
                ? undefined
                : ({
                      value: edit?.cellCulturePair?.cell,
                      label: edit?.cellCulturePair?.cell?.name ?? "",
                  } as SelectOption<Cell>),
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const [cultureSelectState, setCultureSelectState] = useState<
        SelectState<Culture>
    >({
        selected:
            edit === undefined
                ? undefined
                : ({
                      value: edit?.cellCulturePair?.culture,
                      label: edit?.cellCulturePair?.culture?.name ?? "",
                  } as SelectOption<Culture>),
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const [buyerSelectState, setBuyerSelectState] = useState<
        SelectState<Buyer>
    >({
        selected:
            edit === undefined
                ? undefined
                : ({
                      value: edit?.buyer,
                      label: edit?.buyer?.name ?? "",
                  } as SelectOption<Buyer>),
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

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
                    dataGroupId: dataGroupContextValue.selectedGroup,
                },
            },
            {
                queryKey: [
                    "getPairedCellsForm",
                    cellSelectState.limit,
                    cellSelectState.page,
                    cultureSelectState.selected,
                    dataGroupContextValue.selectedGroup,
                ],
                keepPreviousData: true,
            }
        );

    const { data: cultureData, isFetching: isFetchingCultures } =
        useGetPairedCulturesQuery(
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
                    dataGroupId: dataGroupContextValue.selectedGroup,
                },
            },
            {
                queryKey: [
                    "getPairedCulturesForm",
                    cultureSelectState.limit,
                    cultureSelectState.page,
                    cellSelectState.selected,
                    dataGroupContextValue.selectedGroup,
                ],
                keepPreviousData: true,
            }
        );

    const { data: buyerData, isFetching: isFetchingBuyers } = useGetBuyersQuery(
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
            setCultureSelectState((old) => ({
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
        <BaseForm
            submitDisabled={insert.isLoading || update.isLoading}
            onSubmit={
                edit
                    ? handleSubmit(onUpdateSubmit)
                    : handleSubmit(onInsertSubmit)
            }
        >
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
                                    styles={selectStyle(errors.culture)}
                                    isMulti={false}
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
                                    styles={selectStyle(errors.cell)}
                                    isMulti={false}
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
                                    styles={selectStyle(errors.buyer)}
                                    isMulti={false}
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
