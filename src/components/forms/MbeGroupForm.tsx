import { Grid, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    MbeGroup,
    MbeGroupInsertOptions,
    useInsertMbeGroupMutation,
    useUpdateMbeGroupMutation,
} from "../../generated/graphql";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import BaseForm from "./BaseForm";

type MbeGroupFormProps = {
    edit?: MbeGroup;
    onInsertSuccess?: () => void;
    onUpdateSuccess?: () => void;
};

export default function MbeGroupForm({
    edit,
    onUpdateSuccess,
    onInsertSuccess,
}: MbeGroupFormProps) {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MbeGroupInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
        },
    });

    useEffect(() => {
        if (edit) {
            reset({ name: edit?.name ?? "" });
        }
    }, [edit, reset]);

    const insert = useInsertMbeGroupMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (_data, _variables, _context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess();
            }
        },
    });

    const update = useUpdateMbeGroupMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (_data, _variables, _context) => {
            // WARN: causes flickering input text on save
            reset();
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        },
    });

    return (
        <BaseForm
            submitDisabled={insert.isLoading}
            onSubmit={handleSubmit((data) => {
                edit
                    ? update.mutate({
                          options: {
                              idGroup: edit.id,
                              ...data,
                          },
                      })
                    : insert.mutate({
                          options: {
                              ...data,
                          },
                      });
            })}
        >
            <Grid mb="sm">
                <Grid.Col>
                    <TextInput
                        {...register("name", {
                            required: t("dataGroup.errors.name"),
                        })}
                        label={
                            edit ? t("mbeGroup.name") : t("mbeGroup.newName")
                        }
                        placeholder={
                            edit ? t("mbeGroup.name") : t("mbeGroup.newName")
                        }
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.name ? t("dataGroup.errors.name") : undefined
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
