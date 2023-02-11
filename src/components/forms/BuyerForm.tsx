import { Grid, TextInput } from "@mantine/core";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Buyer,
    BuyerInsertOptions,
    BuyerUpdateOptions,
    InsertBuyerMutation,
    UpdateBuyerMutation,
    useInsertBuyerMutation,
    useUpdateBuyerMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";

export default function BuyerForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    Buyer,
    InsertBuyerMutation,
    BuyerInsertOptions,
    UpdateBuyerMutation,
    BuyerUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BuyerInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            address: edit?.address ?? "",
            contact: edit?.contact ?? "",
        },
    });

    const insert = useInsertBuyerMutation({
        onSuccess: (data, variables, context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateBuyerMutation({
        onSuccess: (data, variables, context) => {
            if (onUpdateSuccess) {
                onUpdateSuccess(data, variables, context);
            }
        },
    });

    console.log(errors.name);

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
                            required: t("buyer.errors.name"),
                        })}
                        label={t("buyer.name")}
                        placeholder={t("buyer.name")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.name === undefined
                                ? undefined
                                : t("buyer.errors.name")
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
                {/* <Grid.Col>
                    <TextInput
                        {...register("address", {})}
                        label={t("buyer.address")}
                        placeholder={t("buyer.address")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.name === undefined
                                ? undefined
                                : "err"
                        }
                    />
                </Grid.Col>
                <Grid.Col>
                    <TextInput
                        {...register("contact", {})}
                        label={t("buyer.contact")}
                        placeholder={t("buyer.contact")}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.name === undefined
                                ? undefined
                                : "err"
                        }
                    />
                </ Grid.Col> */}
            </Grid>
        </BaseForm>
    );
}
