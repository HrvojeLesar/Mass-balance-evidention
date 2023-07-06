import { Grid, Select, TextInput } from "@mantine/core";
import { useContext, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    DataGroup,
    DataGroupInsertOptions,
    useInsertDataGroupMutation,
    useUpdateDataGroupMutation,
} from "../../generated/graphql";
import { MbeGroupContext } from "../../MbeGroupProvider";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
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
    const mbeGroupContextValue = useContext(MbeGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<DataGroupInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
            idMbeGroup: edit?.idMbeGroup ?? mbeGroupContextValue.selectedGroup,
        },
    });

    // WARN: Inefficient, calls reset on every group change
    useEffect(() => {
        reset({ idMbeGroup: mbeGroupContextValue.selectedGroup });
    }, [mbeGroupContextValue, reset]);

    useEffect(() => {
        reset({ name: edit?.name ?? "", description: edit?.description });
    }, [edit, reset]);

    const insert = useInsertDataGroupMutation({
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

    const update = useUpdateDataGroupMutation({
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
            onSubmit={
                edit
                    ? handleSubmit((data) => {
                          // TODO: Update mbe group (backend doesn't support this currently)
                          update.mutate({
                              updateOptions: {
                                  id: edit.id,
                                  name: data.name,
                                  description: data.description,
                              },
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
                            errors.name ? t("dataGroup.errors.name") : undefined
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
            <Grid mb="sm">
                <Grid.Col>
                    <Controller
                        name="idMbeGroup"
                        control={control}
                        rules={{ required: t("dataGroup.errors.name") }}
                        render={({ field: { onChange } }) => (
                            <Select
                                label={t("mbeGroupMember.group")}
                                value={
                                    mbeGroupContextValue.selectedGroup
                                        ? mbeGroupContextValue.selectedGroup.toString()
                                        : undefined
                                }
                                disabled={
                                    mbeGroupContextValue.isLoading ||
                                    mbeGroupContextValue.isEmpty
                                }
                                onChange={(val) => {
                                    if (
                                        mbeGroupContextValue.selectGroup !==
                                        undefined
                                    ) {
                                        mbeGroupContextValue.selectGroup(
                                            Number(val)
                                        );
                                        onChange(Number(val));
                                    }
                                }}
                                data={
                                    mbeGroupContextValue.isLoading
                                        ? [
                                              {
                                                  value: "loading",
                                                  label: t(
                                                      "loading"
                                                  ).toString(),
                                              },
                                          ]
                                        : mbeGroupContextValue.groups?.map(
                                              (group) => ({
                                                  value: group.id.toString(),
                                                  label: group.name,
                                              })
                                          ) ?? []
                                }
                                withAsterisk
                                error={
                                    errors.idMbeGroup
                                        ? t("dataGroup.errors.name")
                                        : undefined
                                }
                                withinPortal
                            />
                        )}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
