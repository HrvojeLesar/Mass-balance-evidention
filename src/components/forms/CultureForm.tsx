import { Grid, TextInput } from "@mantine/core";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Culture,
    CultureInsertOptions,
    CultureUpdateOptions,
    InsertCultureMutation,
    UpdateCultureMutation,
    useInsertCultureMutation,
    useUpdateCultureMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";

export default function CultureForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    Culture,
    InsertCultureMutation,
    CultureInsertOptions,
    UpdateCultureMutation,
    CultureUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CultureInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
        },
    });

    const insert = useInsertCultureMutation({
        onSuccess: (data, variables, context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateCultureMutation({
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
                <Grid.Col>
                    <TextInput
                        {...register("name", {
                            required: t("culture.errors.name"),
                        })}
                        label={t("culture.name")}
                        placeholder={t("culture.name")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.name ? t("culture.errors.name") : undefined
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
                {/* <Grid.Col>
                        <TextInput
                            {...register("description", {})}
                            label={t("culture.description")}
                            placeholder={t("culture.description")}
                            autoComplete="off"
                            withAsterisk
                            error={
                                errors.name === undefined
                                    ? undefined
                                    : t("culture.errors.name")
                            }
                        />
                    </Grid.Col> */}
            </Grid>
        </BaseForm>
    );
}
