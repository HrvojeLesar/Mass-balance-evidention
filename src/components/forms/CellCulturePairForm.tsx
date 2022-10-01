import { Col, Form, Row } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Cell,
    CellCulturePair,
    CellCulturePairInsertOptions,
    CellCulturePairUpdateOptions,
    CellFields,
    Culture,
    CultureFields,
    InsertCellCulturePairMutation,
    Ordering,
    UpdateCellCulturePairMutation,
    useGetUnpairedCellsQuery,
    useGetUnpairedCulturesQuery,
    useInsertCellCulturePairMutation,
    useUpdateCellCulturePairMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { useCallback, useEffect, useMemo, useState } from "react";
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

type FormInput = {
    cell: SelectOption<Cell> | undefined;
    culture: SelectOption<Culture> | undefined;
};

const LIMIT = 10;

// TODO: Invalid cell/culture can be selected when other field is loading
export default function CellCulturePairForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    CellCulturePair,
    InsertCellCulturePairMutation,
    CellCulturePairInsertOptions,
    UpdateCellCulturePairMutation,
    CellCulturePairUpdateOptions
>) {
    const { t } = useTranslation();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormInput>({
        mode: "onSubmit",
        defaultValues: {
            cell: {
                value: edit?.cell ?? undefined,
                label: edit?.cell?.name ?? undefined,
            },
            culture: {
                value: edit?.culture ?? undefined,
                label: edit?.culture?.name ?? undefined,
            },
        },
    });

    const insert = useInsertCellCulturePairMutation({
        onSuccess: (data, variables, context) => {
            resetSelects();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateCellCulturePairMutation({
        onSuccess: (data, variables, context) => {
            if (onUpdateSuccess) {
                onUpdateSuccess(data, variables, context);
            }
        },
    });

    const onInsertSubmit = useCallback(
        (data: FormInput) => {
            if (data.cell && data.culture) {
                insert.mutate({
                    insertOptions: {
                        idCell: data.cell?.value.id,
                        idCulture: data.culture?.value.id,
                    },
                });
            } else {
                console.log(
                    "Cell and culture should always be set here: ",
                    data
                );
            }
        },
        [insert]
    );

    const onUpdateSubmit = useCallback(
        (data: FormInput) => {
            if (data.cell && data.culture && edit?.cell && edit?.culture) {
                update.mutate({
                    updateOptions: {
                        idCellOld: edit.cell.id,
                        idCultureOld: edit.culture.id,
                        idCellNew: data.cell?.value.id,
                        idCultureNew: data.culture?.value.id,
                    },
                });
            } else {
                console.log(
                    "Cell and culture should always be set here: ",
                    data
                );
            }
        },
        [update, edit?.cell, edit?.culture]
    );

    const [cellSelectState, setCellSelectState] = useState<SelectState<Cell>>({
        selected:
            edit === undefined
                ? undefined
                : ({
                      value: edit.cell,
                      label: edit?.cell?.name ?? "",
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
                      value: edit.culture,
                      label: edit?.culture?.name ?? "",
                  } as SelectOption<Culture>),
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const resetSelects = useCallback(() => {
        setCellSelectState((old) => ({
            ...old,
            filter: "",
            selected: null,
        }));
        setCultureSelectState((old) => ({
            ...old,
            filter: "",
            selected: null,
        }));
    }, [setCellSelectState, setCultureSelectState]);

    const [debouncedCellInputValue, setDebouncedCellInputValue] = useState("");
    const [debouncedCultureInputValue, setDebouncedCultureInputValue] =
        useState("");

    const cellOptions = useMemo(() => {
        return makeOptions(cellSelectState.page, cellSelectState.pages);
    }, [cellSelectState.page, cellSelectState.pages]);

    const cultureOptions = useMemo(() => {
        return makeOptions(cultureSelectState.page, cultureSelectState.pages);
    }, [cultureSelectState.page, cultureSelectState.pages]);

    const { data: cellData, isFetching: isFetchingCells } =
        useGetUnpairedCellsQuery(
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
                    "getUnpairedCellsForm",
                    cellSelectState.limit,
                    cellSelectState.page,
                    cultureSelectState.selected,
                ],
                keepPreviousData: true,
            }
        );

    const { data: cultureData, isFetching: isFetchingCultures } =
        useGetUnpairedCulturesQuery(
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
                    "getUnpairedCulturesForm",
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
                maxPage: Math.ceil(
                    cultureData.unpairedCultures.total / old.limit
                ),
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
            </Row>
        </BaseForm>
    );
}
