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
    useInsertDispatchNoteArticleMutation,
    useUpdateDispatchNoteArticleMutation,
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
import {
    Grid,
    Input,
    NumberInput,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

type FormInput = {
    article: SelectOption<Article> | undefined;
    measureType: string;
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
    const theme = useMantineTheme();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        register,
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
            measureType: edit ? edit.weightType ?? "" : undefined,
            quantity: edit ? edit.quantity : undefined,
        },
    });

    const insert = useInsertDispatchNoteArticleMutation({
        onSuccess: (data, variables, context) => {
            resetSelects();
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateDispatchNoteArticleMutation({
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
                        weightType: data.measureType,
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
                        weightType: data.measureType,
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

    const [debouncedArticleInputValue, setDebouncedArticleInputValue] =
        useState("");

    const articleOptions = useMemo(() => {
        return makeOptions(articleSelectState.page, articleSelectState.pages);
    }, [articleSelectState.page, articleSelectState.pages]);

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
                ],
                keepPreviousData: true,
            }
        );

    const resetSelects = useCallback(() => {
        setArticleSelectState((old) => ({
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
                <Grid.Col sm={12} md={6} lg={6}>
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
                                value={value ? value : undefined}
                                onChange={onChange}
                                placeholder={t(
                                    "measureType.quantity"
                                ).toString()}
                                label={t("measureType.quantity").toString()}
                                autoComplete="off"
                                spellCheck={false}
                                precision={2}
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
                <Grid.Col sm={12} md={6} lg={6}>
                    <TextInput
                        {...register("measureType", {
                            required: t("weight.errors.name"),
                        })}
                        label={t("measureType.name")}
                        placeholder={t("measureType.name")}
                        autoComplete="off"
                        spellCheck={false}
                        withAsterisk
                        error={
                            errors.quantity
                                ? t("weight.errors.name")
                                : undefined
                        }
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
