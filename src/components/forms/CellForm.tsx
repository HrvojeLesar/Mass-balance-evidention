import { Grid, TextInput } from "@mantine/core";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Cell,
    CellInsertOptions,
    CellUpdateOptions,
    InsertCellMutation,
    UpdateCellMutation,
    useInsertCellMutation,
    useUpdateCellMutation,
} from "../../generated/graphql";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";

export default function CellForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    Cell,
    InsertCellMutation,
    CellInsertOptions,
    UpdateCellMutation,
    CellUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CellInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
        },
        // shouldUnregister: true,
    });

    const insert = useInsertCellMutation({
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

    const update = useUpdateCellMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (data, variables, context) => {
            reset();
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
                            required: t("cell.errors.name"),
                        })}
                        label={t("cell.name")}
                        placeholder={t("cell.name")}
                        autoComplete="off"
                        withAsterisk
                        error={errors.name ? t("cell.errors.name") : undefined}
                        spellCheck={false}
                    />
                </Grid.Col>
                {/* <Grid.Col>
                        <TextInput
                            {...register("description", {})}
                            label={t("cell.description")}
                            placeholder={t("cell.description")}
                            autoComplete="off"
                            withAsterisk
                            error={
                                errors.name === undefined
                                    ? undefined
                                    : t("cell.errors.name")
                            }
                        />
                    </Grid.Col> */}
            </Grid>
        </BaseForm>
    );
}
