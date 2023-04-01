import { Grid, Select, TextInput } from "@mantine/core";
import { useContext, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    DataGroup,
    DataGroupInsertOptions,
    useInsertDataGroupMutation,
    useUpdateDataGroupMutation,
} from "../../generated/graphql";
import { MbeGroupContext } from "../../MbeGroupProvider";
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
    const dataGroupContextValue = useContext(MbeGroupContext);
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
            idMbeGroup: edit?.idMbeGroup ?? dataGroupContextValue.selectedGroup,
        },
    });

    const isGroupsEmpty = useMemo(
        () => dataGroupContextValue.groups?.length === 0,
        [dataGroupContextValue]
    );

    // WARN: Inefficient, calls reset on every group change
    useEffect(() => {
        reset({ idMbeGroup: dataGroupContextValue.selectedGroup });
    }, [dataGroupContextValue]);

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
                                label={"RENAME ME"}
                                value={
                                    dataGroupContextValue.selectedGroup
                                        ? dataGroupContextValue.selectedGroup.toString()
                                        : undefined
                                }
                                disabled={
                                    dataGroupContextValue.isLoading ||
                                    isGroupsEmpty
                                }
                                onChange={(val) => {
                                    if (
                                        dataGroupContextValue.selectGroup !==
                                        undefined
                                    ) {
                                        dataGroupContextValue.selectGroup(
                                            Number(val)
                                        );
                                        onChange(Number(val));
                                    }
                                }}
                                data={
                                    dataGroupContextValue.isLoading
                                        ? [
                                              {
                                                  value: "loading",
                                                  label: t(
                                                      "loading"
                                                  ).toString(),
                                              },
                                          ]
                                        : dataGroupContextValue.groups?.map(
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
                            />
                        )}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
