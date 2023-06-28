import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Cell,
    CellCulturePair,
    CellCulturePairIds,
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
import { DataGroupContext } from "../../DataGroupProvider";
import { Grid, Input, useMantineTheme } from "@mantine/core";
import displayOnErrorNotification from "../util/deleteNotificationUtil";

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
    CellCulturePairIds,
    UpdateCellCulturePairMutation,
    CellCulturePairUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);

    const theme = useMantineTheme();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm<FormInput>({
        mode: "onSubmit",
        defaultValues: {
            cell: edit
                ? {
                      value: edit.cell ?? undefined,
                      label: edit.cell.name ?? undefined,
                  }
                : undefined,
            culture: edit
                ? {
                      value: edit.culture ?? undefined,
                      label: edit.culture.name ?? undefined,
                  }
                : undefined,
        },
    });

    const insert = useInsertCellCulturePairMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (data, variables, context) => {
            reset();
            resetSelects();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateCellCulturePairMutation({
        onError: () => {
            displayOnErrorNotification();
        },
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
                        dGroup: dataGroupContextValue.selectedGroup ?? 1,
                    },
                });
            } else {
                console.log(
                    "Cell and culture should always be set here: ",
                    data
                );
            }
        },
        [insert, dataGroupContextValue]
    );

    const onUpdateSubmit = useCallback(
        (data: FormInput) => {
            if (data.cell && data.culture && edit?.cell && edit?.culture) {
                update.mutate({
                    updateOptions: {
                        id: edit.id,
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
        [update, edit?.id, edit?.cell, edit?.culture]
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

    const {
        data: cellData,
        isFetching: isFetchingCells,
        refetch: refetchCells,
    } = useGetUnpairedCellsQuery(
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
                                  field: CellFields.Name,
                              },
                          ]
                        : undefined,
                dGroup: dataGroupContextValue.selectedGroup ?? -1,
            },
        },
        {
            queryKey: [
                "getUnpairedCellsForm",
                cellSelectState.limit,
                cellSelectState.page,
                cultureSelectState.selected,
                dataGroupContextValue.selectedGroup,
            ],
            keepPreviousData: true,
        }
    );

    const {
        data: cultureData,
        isFetching: isFetchingCultures,
        refetch: refetchCultures,
    } = useGetUnpairedCulturesQuery(
        {
            options: {
                id: {
                    idCell: cellSelectState.selected?.value.id ?? undefined,
                },
                pageSize: cultureSelectState.limit,
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
                dGroup: dataGroupContextValue.selectedGroup ?? -1,
            },
        },
        {
            queryKey: [
                "getUnpairedCulturesForm",
                cultureSelectState.limit,
                cultureSelectState.page,
                cellSelectState.selected,
                dataGroupContextValue.selectedGroup,
            ],
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        if (cellData) {
            setCellSelectState((old) => ({
                ...old,
                maxPage: cellData.unpairedCells.totalPages,
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
                maxPage: cultureData.unpairedCultures.totalPages,
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

    return (
        <BaseForm
            submitDisabled={insert.isLoading || update.isLoading}
            onSubmit={
                edit
                    ? handleSubmit(onUpdateSubmit)
                    : handleSubmit(onInsertSubmit)
            }
        >
            <Grid mb="sm">
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
                                    menuPortalTarget={document.body}
                                    placeholder={t("cell.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    styles={selectStyle(errors.cell, theme)}
                                    isMulti={false}
                                    value={cellSelectState.selected}
                                    options={cellOptions}
                                    onMenuOpen={() => {
                                        refetchCells();
                                    }}
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
                                    menuPortalTarget={document.body}
                                    placeholder={t("culture.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    styles={selectStyle(errors.culture, theme)}
                                    isMulti={false}
                                    value={cultureSelectState.selected}
                                    options={cultureOptions}
                                    onMenuOpen={() => {
                                        refetchCultures();
                                    }}
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
                                    }}
                                    isLoading={isFetchingCultures}
                                    isClearable
                                />
                            </Input.Wrapper>
                        )}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
