import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import "dayjs/locale/hr";
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
    FieldTypes,
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
import { Grid, Input, NumberInput, useMantineTheme } from "@mantine/core";
import { DatePicker } from "@mantine/dates";

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
    const { t, i18n } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const theme = useMantineTheme();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        getValues,
        formState: { errors },
    } = useForm<FormInput>({
        mode: "onSubmit",
        defaultValues: {
            cell: edit
                ? {
                      value: edit.cell,
                      label: edit.cell.name ?? undefined,
                  }
                : undefined,
            culture: edit
                ? {
                      value: edit?.culture ?? undefined,
                      label: edit?.culture?.name ?? undefined,
                  }
                : undefined,
            buyer: edit
                ? {
                      value: edit?.buyer ?? undefined,
                      label: edit?.buyer?.name ?? undefined,
                  }
                : undefined,
            // date: moment(Date.now()).format("YYYY-MM-DD"),
            date: edit
                ? moment(edit.date as Date).format("YYYY-MM-DD")
                : undefined,
            weight: edit ? edit.weight : undefined,
            // weight: 123,
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
                        idCell: data.cell.value.id,
                        idCulture: data.culture.value.id,
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
                        pairIds: {
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
                      value: edit?.cell,
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
                      value: edit?.culture,
                      label: edit?.culture?.name ?? "",
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
                options: {
                    id: {
                        idCulture:
                            cultureSelectState.selected?.value.id ?? undefined,
                    },
                    pageSize: cellSelectState.limit,
                    page: cellSelectState.page,
                    ordering: {
                        order: Ordering.Asc,
                        orderBy: CellFields.Id,
                    },
                    filters:
                        cellSelectState.filter !== ""
                            ? [
                                  {
                                      value: cellSelectState.filter,
                                      fieldType: FieldTypes.String,
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
                options: {
                    id: {
                        idCell: cellSelectState.selected?.value.id ?? undefined,
                    },
                    pageSize: cultureSelectState.limit,
                    page: cultureSelectState.page,
                    ordering: {
                        order: Ordering.Asc,
                        orderBy: CultureFields.Id,
                    },
                    filters:
                        cultureSelectState.filter !== ""
                            ? [
                                  {
                                      value: cultureSelectState.filter,
                                      fieldType: FieldTypes.String,
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
            options: {
                id: undefined,
                pageSize: buyerSelectState.limit,
                page: buyerSelectState.page,
                ordering: {
                    order: Ordering.Asc,
                    orderBy: BuyerFields.Id,
                },
                filters:
                    buyerSelectState.filter !== ""
                        ? [
                              {
                                  value: buyerSelectState.filter,
                                  fieldType: FieldTypes.String,
                                  field: BuyerFields.Name,
                              },
                          ]
                        : undefined,
                dataGroupId: dataGroupContextValue.selectedGroup,
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
                maxPage: cellData.pairedCells.totalPages,
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
                maxPage: cultureData.pairedCultures.totalPages,
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
                maxPage: buyerData.buyers.totalPages,
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
            <Grid mb="sm" grow>
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="culture"
                        control={control}
                        rules={{ required: t("culture.errors.name") }}
                        render={() => (
                            <Input.Wrapper
                                label={t("culture.selectPlaceholder")}
                                withAsterisk
                                error={
                                    errors.culture
                                        ? t("culture.errors.name")
                                        : undefined
                                }
                            >
                                <Select
                                    placeholder={t("culture.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    styles={selectStyle(errors.culture, theme)}
                                    isMulti={false}
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
                                            {
                                                shouldValidate: true,
                                            }
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
                            </Input.Wrapper>
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="cell"
                        control={control}
                        rules={{ required: t("cell.errors.name") }}
                        render={() => (
                            <Input.Wrapper
                                label={t("cell.selectPlaceholder")}
                                withAsterisk
                                error={
                                    errors.cell
                                        ? t("cell.errors.name")
                                        : undefined
                                }
                            >
                                <Select
                                    placeholder={t("cell.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    styles={selectStyle(errors.cell, theme)}
                                    isMulti={false}
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
                            </Input.Wrapper>
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="weight"
                        control={control}
                        rules={{ required: t("weight.errors.name") }}
                        render={({ field: { value, onChange } }) => (
                            <NumberInput
                                decimalSeparator={
                                    i18n.language === "hr" ? "," : "."
                                }
                                value={value ? value : undefined}
                                onChange={onChange}
                                placeholder={t("entry.weight").toString()}
                                label={t("entry.weight").toString()}
                                autoComplete="off"
                                withAsterisk
                                error={
                                    errors.weight
                                        ? t("cell.errors.name")
                                        : undefined
                                }
                                spellCheck={false}
                                precision={2}
                                step={0.5}
                            />
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="buyer"
                        control={control}
                        rules={{ required: t("buyer.errors.name") }}
                        render={() => (
                            <Input.Wrapper
                                label={t("buyer.selectPlaceholder")}
                                withAsterisk
                                error={
                                    errors.buyer
                                        ? t("buyer.errors.name")
                                        : undefined
                                }
                            >
                                <Select
                                    placeholder={t("buyer.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    styles={selectStyle(errors.buyer, theme)}
                                    isMulti={false}
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
                            </Input.Wrapper>
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="date"
                        control={control}
                        rules={{ required: t("date.errors.name") }}
                        render={({ field: { value, onChange } }) => {
                            const date =
                                typeof value === "string"
                                    ? new Date(value)
                                    : value;
                            return (
                                <DatePicker
                                    locale={i18n.language}
                                    value={date}
                                    label={t("entry.date")}
                                    placeholder={t("entry.date")}
                                    autoComplete="off"
                                    onChange={onChange}
                                    withAsterisk
                                    error={
                                        errors.date
                                            ? t("cell.errors.name")
                                            : undefined
                                    }
                                    spellCheck={false}
                                />
                            );
                        }}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
