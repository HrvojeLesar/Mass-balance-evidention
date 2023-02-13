import { Grid, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    DataGroup,
    DataGroupInsertOptions,
    useInsertDataGroupMutation,
    useUpdateDataGroupMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";

type DataGroupFormProps = {
    edit?: DataGroup;
    onInsertSuccess?: () => void;
    onUpdateSuccess?: () => void;
};

export default function DataGroupForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: DataGroupFormProps) {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DataGroupInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
        },
    });

    useEffect(() => {
        reset({ name: edit?.name ?? "", description: edit?.description });
    }, [edit, reset]);

    const insert = useInsertDataGroupMutation({
        onSuccess: (_data, _variables, _context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess();
            }
        },
    });

    const update = useUpdateDataGroupMutation({
        onSuccess: (_data, _variables, _context) => {
            // WARN: causes flickering input text on save
            // reset();
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        },
    });

    return (
        <BaseForm
            submitDisabled={insert.isLoading}
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
                              },
                          });
                      })
            }
        >
            <Grid mb="sm">
                <Grid.Col>
                    <TextInput
                        {...register("name", {
                            required: t("dataGroup.errors.name"),
                        })}
                        label={t("dataGroup.name")}
                        placeholder={t("dataGroup.name")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.name ? t("culture.errors.name") : undefined
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
            </Grid>
            <Grid mb="sm">
                <Grid.Col>
                    <TextInput
                        {...register("description", {})}
                        label={t("dataGroup.description")}
                        placeholder={t("dataGroup.description")}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
