import { Grid, NumberInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import moment from "moment";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    DispatchNote,
    DispatchNoteInsertOptions,
    DispatchNoteUpdateOptions,
    InsertDispatchNoteMutation,
    UpdateDispatchNoteMutation,
    useInsertDispatchNoteMutation,
    useUpdateDispatchNoteMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";

export default function DispatchNoteForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    DispatchNote,
    InsertDispatchNoteMutation,
    DispatchNoteInsertOptions,
    UpdateDispatchNoteMutation,
    DispatchNoteUpdateOptions
>) {
    const { t, i18n } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const { handleSubmit, reset, control } = useForm<DispatchNoteInsertOptions>(
        {
            mode: "onChange",
            defaultValues: {
                noteType: edit?.noteType,
                numericalIdentifier: edit?.numericalIdentifier,
                issuingDate: edit?.issuingDate,
            },
        }
    );

    const insert = useInsertDispatchNoteMutation({
        onSuccess: (data, variables, context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateDispatchNoteMutation({
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
                              updateOptions: {
                                  ...data,
                                  id: edit.id,
                                  // WARN: Very dumb hacky way to fix a day off value
                                  issuingDate: new Date(
                                      moment(data.issuingDate).format(
                                          "YYYY-MM-DD"
                                      )
                                  ),
                              },
                          });
                      })
                    : handleSubmit((data) => {
                          insert.mutate({
                              insertOptions: {
                                  ...data,
                                  // WARN: Very dumb hacky way to fix a day off value
                                  issuingDate: new Date(
                                      moment(data.issuingDate).format(
                                          "YYYY-MM-DD"
                                      )
                                  ),
                                  dGroup:
                                      dataGroupContextValue.selectedGroup ?? 1,
                              },
                          });
                      })
            }
        >
            <Grid mb="sm">
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="noteType"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <NumberInput
                                value={value ? value : undefined}
                                onChange={onChange}
                                label={t("dispatchNote.noteType")}
                                placeholder={t("dispatchNote.noteType")}
                                autoComplete="off"
                                spellCheck={false}
                            />
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="numericalIdentifier"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <NumberInput
                                value={value ? value : undefined}
                                onChange={onChange}
                                label={t("dispatchNote.numericalIdentifier")}
                                placeholder={t(
                                    "dispatchNote.numericalIdentifier"
                                )}
                                autoComplete="off"
                                spellCheck={false}
                            />
                        )}
                    />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <Controller
                        name="issuingDate"
                        control={control}
                        render={({ field: { value, onChange } }) => {
                            const date =
                                typeof value === "string"
                                    ? new Date(value)
                                    : value;
                            return (
                                <DatePicker
                                    // dropdownType="modal"
                                    inputFormat="DD.MM.YYYY"
                                    allowFreeInput
                                    locale={i18n.language}
                                    value={date}
                                    label={t("dispatchNote.issuingDate")}
                                    placeholder={t("dispatchNote.issuingDate")}
                                    autoComplete="off"
                                    onChange={onChange}
                                    spellCheck={false}
                                />
                            );
                        }}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
