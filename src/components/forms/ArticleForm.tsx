import { Grid, TextInput } from "@mantine/core";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Article,
    ArticleInsertOptions,
    ArticleUpdateOptions,
    InsertArticleMutation,
    UpdateArticleMutation,
    useInsertArticleMutation,
    useUpdateArticleMutation,
} from "../../generated/graphql";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";

export default function ArticleForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    Article,
    InsertArticleMutation,
    ArticleInsertOptions,
    UpdateArticleMutation,
    ArticleUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ArticleInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
        },
    });

    const insert = useInsertArticleMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (data, variables, context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateArticleMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (data, variables, context) => {
            if (onUpdateSuccess) {
                onUpdateSuccess(data, variables, context);
            }
        },
    });

    return (
        <BaseForm
            submitDisabled={insert.isLoading || update.isLoading}
            onSubmit={
                edit
                    ? handleSubmit((data) => {
                          update.mutate({
                              updateOptions: { ...data, id: edit.id },
                          });
                      })
                    : handleSubmit((data) => {
                          insert.mutate({
                              insertOptions: {
                                  ...data,
                                  dGroup:
                                      dataGroupContextValue.selectedGroup ?? 1,
                              },
                          });
                      })
            }
        >
            <Grid mb="sm">
                <Grid.Col sm={12} md={6} lg={6}>
                    <TextInput
                        {...register("name", {
                            required: t("article.errors.name"),
                        })}
                        label={t("article.name")}
                        placeholder={t("article.name")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.name ? t("article.errors.name") : undefined
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <TextInput
                        {...register("description", {})}
                        label={t("article.description")}
                        placeholder={t("article.description")}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
