import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import "dayjs/locale/hr";
import {
    Article,
    ArticleFields,
    DispatchNoteArticle,
    DispatchNoteArticleInsertOptions,
    DispatchNoteArticleUpdateOptions,
    InsertDispatchNoteArticleMutation,
    Ordering,
    UpdateDispatchNoteArticleMutation,
    useGetArticlesQuery,
    useGetWeightTypesQuery,
    useInsertDispatchNoteArticleMutation,
    useUpdateDispatchNoteArticleMutation,
    WeightType,
    WeightTypeFields,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
    DEBOUNCE_TIME,
    FormProps,
    makeOptions,
    makeOptionsDirty,
    onChange,
    SelectOption,
    SelectState,
    selectStyle,
} from "./FormUtils";
import { DataGroupContext } from "../../DataGroupProvider";
import { Grid, Input, NumberInput, useMantineTheme } from "@mantine/core";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import { MbeGroupContext } from "../../MbeGroupProvider";

type FormInput = {
    article: SelectOption<Article> | undefined;
    measureType: SelectOption<WeightType> | undefined;
    quantity: number;
};

const LIMIT = 10;

type DispatchNoteArticleFormProps = FormProps<
    DispatchNoteArticle,
    InsertDispatchNoteArticleMutation,
    DispatchNoteArticleInsertOptions,
    UpdateDispatchNoteArticleMutation,
    DispatchNoteArticleUpdateOptions
> & {
    dispatchNoteId: number;
};

export default function DispatchNoteArticleForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
    dispatchNoteId,
}: DispatchNoteArticleFormProps) {
    const { t, i18n } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const mbeGroupContextValue = useContext(MbeGroupContext);

    const theme = useMantineTheme();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormInput>({
        mode: "onSubmit",
        defaultValues: {
            article: edit
                ? {
                      value: edit.article,
                      label: edit.article.name ?? undefined,
                  }
                : undefined,
            // WARN: Missing proper undefined handling on weightType
            quantity: edit ? edit.quantity : undefined,
            measureType: edit
                ? {
                      value: edit.weightType,
                      label: edit.weightType.unitShort,
                  }
                : undefined,
        },
    });

    const insert = useInsertDispatchNoteArticleMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (data, variables, context) => {
            resetSelects();
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateDispatchNoteArticleMutation({
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
            if (data.quantity && data.article && data.measureType) {
                insert.mutate({
                    insertOptions: {
                        quantity: data.quantity,
                        idArticle: data.article.value.id,
                        idDispatchNote: dispatchNoteId,
                        weightType: data.measureType.value.id,
                        dGroup: dataGroupContextValue.selectedGroup ?? 1,
                    },
                });
            } else {
                console.log(
                    "Quantity, article, measureType should always be set",
                    data
                );
            }
        },
        [insert, dataGroupContextValue.selectedGroup, dispatchNoteId]
    );

    const onUpdateSubmit = useCallback(
        (data: FormInput) => {
            if (edit && data.quantity && data.article && data.measureType) {
                update.mutate({
                    updateOptions: {
                        id: edit?.id,
                        idDispatchNote: dispatchNoteId,
                        idArticle: data.article.value.id,
                        quantity: data.quantity,
                        weightType: data.measureType.value.id,
                    },
                });
            } else {
                console.log(
                    "Quantity, article, measureType should always be set",
                    data
                );
            }
        },
        [edit, update, dispatchNoteId]
    );

    const [articleSelectState, setArticleSelectState] = useState<
        SelectState<Article>
    >({
        selected: edit
            ? {
                  value: edit.article,
                  label: edit.article.name,
              }
            : undefined,
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const [weightTypeSelectState, setWeightTypeSelectState] = useState<
        SelectState<WeightType>
    >({
        selected:
            edit === undefined
                ? undefined
                : ({
                      value: edit?.weightType,
                      label: edit?.weightType?.unitShort ?? "",
                  } as SelectOption<WeightType>),
        page: 1,
        pages: {},
        limit: LIMIT,
        filter: "",
        maxPage: 1,
    });

    const [debouncedArticleInputValue, setDebouncedArticleInputValue] =
        useState("");
    const [debouncedWeightTypeInputValue, setDebouncedWeightTypeInputValue] =
        useState("");

    const articleOptions = useMemo(() => {
        return makeOptions(articleSelectState.page, articleSelectState.pages);
    }, [articleSelectState.page, articleSelectState.pages]);
    const weightTypeOptions = useMemo(() => {
        return makeOptionsDirty(
            weightTypeSelectState.page,
            weightTypeSelectState.pages
        );
    }, [weightTypeSelectState.page, weightTypeSelectState.pages]);

    const { data: articleData, isFetching: isFetchingArticles } =
        useGetArticlesQuery(
            {
                options: {
                    id: undefined,
                    pageSize: articleSelectState.limit,
                    page: articleSelectState.page,
                    ordering: {
                        order: Ordering.Asc,
                        orderBy: ArticleFields.Id,
                    },
                    filters:
                        articleSelectState.filter !== ""
                            ? [
                                  {
                                      value: articleSelectState.filter,
                                      field: ArticleFields.Name,
                                  },
                              ]
                            : undefined,
                    dGroup: dataGroupContextValue.selectedGroup ?? -1,
                },
            },
            {
                queryKey: [
                    "getArticlesForm",
                    articleSelectState.limit,
                    articleSelectState.page,
                    dataGroupContextValue.selectedGroup,
                ],
                keepPreviousData: true,
                enabled: dataGroupContextValue.selectedGroup !== undefined,
            }
        );

    const { data: weightTypeData, isFetching: isFetchingWeightTypes } =
        useGetWeightTypesQuery(
            {
                options: {
                    id: undefined,
                    pageSize: weightTypeSelectState.limit,
                    page: weightTypeSelectState.page,
                    ordering: {
                        order: Ordering.Asc,
                        orderBy: WeightTypeFields.Id,
                    },
                    filters:
                        weightTypeSelectState.filter !== ""
                            ? [
                                  {
                                      value: weightTypeSelectState.filter,
                                      field: WeightTypeFields.UnitShort,
                                  },
                              ]
                            : undefined,
                    mbeGroupId: mbeGroupContextValue.selectedGroup ?? -1,
                },
            },
            {
                queryKey: [
                    "getWeightTypesDNAForm",
                    weightTypeSelectState.limit,
                    weightTypeSelectState.page,
                    mbeGroupContextValue.selectedGroup,
                ],
                keepPreviousData: true,
                enabled: mbeGroupContextValue.selectedGroup !== undefined,
            }
        );

    const resetSelects = useCallback(() => {
        setArticleSelectState((old) => ({
            ...old,
            filter: "",
            selected: null,
        }));
        setWeightTypeSelectState((old) => ({
            ...old,
            filter: "",
            selected: null,
        }));
    }, [setArticleSelectState]);

    useEffect(() => {
        if (articleData) {
            setArticleSelectState((old) => ({
                ...old,
                maxPage: articleData.articles.totalPages,
                pages: {
                    ...old.pages,
                    [articleData.articles.page]: articleData.articles.results,
                },
            }));
        }
    }, [articleData, setArticleSelectState]);

    useEffect(() => {
        if (weightTypeData) {
            setWeightTypeSelectState((old) => ({
                ...old,
                maxPage: weightTypeData.weightTypes.totalPages,
                pages: {
                    ...old.pages,
                    [weightTypeData.weightTypes.page]:
                        weightTypeData.weightTypes.results,
                },
            }));
        }
    }, [weightTypeData, setWeightTypeSelectState]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setArticleSelectState((old) => ({
                ...old,
                page: 1,
                filter: debouncedArticleInputValue.trim(),
            }));
        }, DEBOUNCE_TIME);
        return () => {
            clearTimeout(timeout);
        };
    }, [debouncedArticleInputValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setWeightTypeSelectState((old) => ({
                ...old,
                page: 1,
                filter: debouncedWeightTypeInputValue.trim(),
            }));
        }, DEBOUNCE_TIME);
        return () => {
            clearTimeout(timeout);
        };
    }, [debouncedWeightTypeInputValue]);

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
                <Grid.Col sm={12} md={12} lg={12}>
                    <Controller
                        name="article"
                        control={control}
                        rules={{ required: t("article.errors.name") }}
                        render={() => (
                            <Input.Wrapper
                                label={t("article.selectPlaceholder")}
                                withAsterisk
                                error={
                                    errors.article
                                        ? t("article.errors.name")
                                        : undefined
                                }
                            >
                                <Select
                                    menuPortalTarget={document.body}
                                    placeholder={t("article.selectPlaceholder")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    styles={selectStyle(errors.article, theme)}
                                    isMulti={false}
                                    value={articleSelectState.selected}
                                    options={articleOptions}
                                    onMenuClose={() => {
                                        setArticleSelectState((old) => ({
                                            ...old,
                                            page: 1,
                                        }));
                                    }}
                                    onMenuScrollToBottom={
                                        articleSelectState.page <
                                        articleSelectState.maxPage
                                            ? () => {
                                                  setArticleSelectState(
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
                                            setDebouncedArticleInputValue(
                                                value
                                            );
                                        }
                                    }}
                                    onChange={(value, actionMeta) => {
                                        onChange(
                                            value,
                                            actionMeta,
                                            setArticleSelectState
                                        );
                                        setValue(
                                            "article",
                                            value ?? undefined,
                                            {
                                                shouldValidate: true,
                                            }
                                        );
                                    }}
                                    isLoading={isFetchingArticles}
                                    isClearable
                                />
                            </Input.Wrapper>
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={8} md={8} lg={8}>
                    <Controller
                        name="quantity"
                        control={control}
                        rules={{ required: t("weight.errors.name") }}
                        render={({ field: { value, onChange } }) => (
                            <NumberInput
                                withAsterisk
                                decimalSeparator={
                                    i18n.language === "hr" ? "," : "."
                                }
                                value={value ? value : ""}
                                onChange={onChange}
                                placeholder={t(
                                    "measureType.quantity"
                                ).toString()}
                                label={t("measureType.quantity").toString()}
                                autoComplete="off"
                                spellCheck={false}
                                precision={10}
                                removeTrailingZeros
                                step={0.5}
                                error={
                                    errors.quantity
                                        ? t("weight.errors.name")
                                        : undefined
                                }
                            />
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={4} md={4} lg={4}>
                    <Controller
                        name="measureType"
                        control={control}
                        rules={{ required: t("weight.errors.name") }}
                        render={() => (
                            <Input.Wrapper
                                label={t("measureType.name")}
                                withAsterisk
                                error={
                                    errors.measureType
                                        ? t("weight.errors.name")
                                        : undefined
                                }
                            >
                                <Select
                                    menuPortalTarget={document.body}
                                    placeholder={t("measureType.name")}
                                    loadingMessage={() => t("loading")}
                                    noOptionsMessage={() => t("noOptions")}
                                    styles={selectStyle(
                                        errors.measureType,
                                        theme
                                    )}
                                    isMulti={false}
                                    value={weightTypeSelectState.selected}
                                    options={weightTypeOptions}
                                    onMenuClose={() => {
                                        setWeightTypeSelectState((old) => ({
                                            ...old,
                                            page: 1,
                                        }));
                                    }}
                                    onMenuScrollToBottom={
                                        weightTypeSelectState.page <
                                        weightTypeSelectState.maxPage
                                            ? () => {
                                                  setWeightTypeSelectState(
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
                                            setDebouncedWeightTypeInputValue(
                                                value
                                            );
                                        }
                                    }}
                                    onChange={(value, actionMeta) => {
                                        onChange(
                                            value,
                                            actionMeta,
                                            setWeightTypeSelectState
                                        );
                                        setValue(
                                            "measureType",
                                            value ?? undefined,
                                            {
                                                shouldValidate: true,
                                            }
                                        );
                                    }}
                                    isLoading={isFetchingWeightTypes}
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
