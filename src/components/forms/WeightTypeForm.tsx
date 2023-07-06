import { Grid, Select, TextInput } from "@mantine/core";
import { useContext, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    useInsertWeightTypeMutation,
    useUpdateWeightTypesMutation,
    WeightType,
    WeightTypeInsertOptions,
} from "../../generated/graphql";
import { MbeGroupContext } from "../../MbeGroupProvider";
import displayOnErrorNotification from "../util/deleteNotificationUtil";
import BaseForm from "./BaseForm";

type WeightTypeFormProps = {
    edit?: WeightType;
    onInsertSuccess?: () => void;
    onUpdateSuccess?: () => void;
};

export default function WeightTypeForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: WeightTypeFormProps) {
    const { t } = useTranslation();
    const mbeGroupContextValue = useContext(MbeGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<WeightTypeInsertOptions>({
        mode: "onChange",
        defaultValues: {
            unit: edit?.unit,
            unitShort: edit?.unitShort,
        },
    });

    // WARN: Inefficient, calls reset on every group change
    useEffect(() => {
        reset({ mbeGroup: mbeGroupContextValue.selectedGroup });
    }, [mbeGroupContextValue, reset]);

    const insert = useInsertWeightTypeMutation({
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

    const update = useUpdateWeightTypesMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (_data, _variables, _context) => {
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
                    ? handleSubmit((data) =>
                          update.mutate({
                              options: {
                                  ...data,
                                  id: edit.id,
                              },
                          })
                      )
                    : handleSubmit((data) => {
                          insert.mutate({
                              options: {
                                  ...data,
                              },
                          });
                      })
            }
        >
            <Grid mb="sm">
                <Grid.Col sm={12} md={6} lg={6}>
                    <TextInput
                        {...register("unit", {
                            required: t("weight.errors.name"),
                        })}
                        label={t("measureType.name")}
                        placeholder={t("measureType.name")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.unit ? t("weight.errors.name") : undefined
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <TextInput
                        {...register("unitShort", {
                            required: t("dataGroup.errors.name"),
                        })}
                        label={t("measureType.nameShort")}
                        placeholder={t("measureType.nameShort")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.unit ? t("weight.errors.name") : undefined
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
                <Grid.Col>
                    <Controller
                        name="mbeGroup"
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
                                    errors.mbeGroup
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
