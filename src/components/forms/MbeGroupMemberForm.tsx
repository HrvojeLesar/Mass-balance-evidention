import { Grid, Select, TextInput } from "@mantine/core";
import { useContext, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    MbeGroupMembersOptions,
    useInsertMbeGroupMemberMutation,
} from "../../generated/graphql";
import { MbeGroupContext } from "../../MbeGroupProvider";
import BaseForm from "./BaseForm";

type MbeGroupMemberFormProps = {
    onInsertSuccess?: () => void;
};

export default function MbeGroupMemberForm({
    onInsertSuccess,
}: MbeGroupMemberFormProps) {
    const { t } = useTranslation();
    const mbeGroupContextValue = useContext(MbeGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<MbeGroupMembersOptions>({
        mode: "onChange",
        defaultValues: {
            idMbeGroup: undefined,
            memberEmail: "",
        },
    });

    const isGroupsEmpty = useMemo(
        () => mbeGroupContextValue.groups?.length === 0,
        [mbeGroupContextValue]
    );

    // WARN: Inefficient, calls reset on every group change
    useEffect(() => {
        reset({ idMbeGroup: mbeGroupContextValue.selectedGroup });
    }, [mbeGroupContextValue, reset]);

    const insert = useInsertMbeGroupMemberMutation({
        onSuccess: (_data, _variables, _context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess();
            }
        },
    });

    return (
        <BaseForm
            submitDisabled={insert.isLoading}
            onSubmit={handleSubmit((data) => {
                insert.mutate({
                    options: {
                        ...data,
                    },
                });
            })}
        >
            <Grid mb="sm">
                <Grid.Col>
                    <TextInput
                        {...register("memberEmail", {
                            required: t("dataGroup.errors.name"),
                        })}
                        label={"E-mail"}
                        placeholder={"E-mail"}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.memberEmail
                                ? t("dataGroup.errors.name")
                                : undefined
                        }
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
                                    isGroupsEmpty
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
                            />
                        )}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
