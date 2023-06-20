import {
    Button,
    createStyles,
    Divider,
    Flex,
    Grid,
    HoverCard,
    NumberInput,
    Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import moment from "moment";
import { useCallback, useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaEdit } from "react-icons/fa";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    DispatchNote,
    DispatchNoteInsertOptions,
    DispatchNoteUpdateOptions,
    InsertDispatchNoteMutation,
    UpdateDispatchNoteMutation,
    useGetDispatchNoteIdentTrackerQuery,
    useInsertDispatchNoteMutation,
    useUpdateDispatchNoteIdentTrackerMutation,
    useUpdateDispatchNoteMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";
import { useEffect } from "react";
import displayOnErrorNotification from "../util/deleteNotificationUtil";

const useStyles = createStyles((_theme) => ({
    faEditIconPointer: {
        "&": {
            fill: "red",
        },
        "&:hover": {
            cursor: "pointer",
            filter: "brightness(85%)",
        },
    },
}));

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
    const { classes } = useStyles();
    const { t, i18n } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);

    const { data, refetch } = useGetDispatchNoteIdentTrackerQuery(
        {
            options: {
                idDataGroup: dataGroupContextValue.selectedGroup ?? -1,
            },
        },
        {
            queryKey: [
                "getDispatchNoteIdentTracker",
                dataGroupContextValue.selectedGroup ?? -1,
            ],
            keepPreviousData: true,
        }
    );

    const [identValue, setIdentValue] = useState<number | "" | undefined>(
        data?.dispatchNoteIdent.identifier
    );

    const { handleSubmit, reset, control, setValue } =
        useForm<DispatchNoteInsertOptions>({
            mode: "onChange",
            defaultValues: {
                noteType: edit?.noteType,
                numericalIdentifier:
                    edit?.numericalIdentifier ??
                    data?.dispatchNoteIdent.identifier,
                issuingDate: edit?.issuingDate,
            },
        });

    const insert = useInsertDispatchNoteMutation({
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

    const update = useUpdateDispatchNoteMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (data, variables, context) => {
            if (onUpdateSuccess) {
                onUpdateSuccess(data, variables, context);
            }
        },
    });

    const updateIdent = useUpdateDispatchNoteIdentTrackerMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: async () => {
            const res = await refetch();
            setIdentValue(res.data?.dispatchNoteIdent.identifier);
            setValue(
                "numericalIdentifier",
                res.data?.dispatchNoteIdent.identifier
            );
        },
    });

    useEffect(() => {
        if (data === undefined || edit) {
            return;
        } else {
            setIdentValue(data?.dispatchNoteIdent.identifier);
            setValue("numericalIdentifier", data?.dispatchNoteIdent.identifier);
        }
    }, [data, setValue, edit]);

    const isIdentNumber = useCallback(() => {
        if (identValue === "" || identValue === undefined) {
            return false;
        }
        return true;
    }, [identValue]);

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
                                precision={10}
                                removeTrailingZeros
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
                                label={
                                    <Flex
                                        gap="sm"
                                        justify="center"
                                        align="center"
                                    >
                                        {t("dispatchNote.numericalIdentifier")}
                                        {edit === undefined ? (
                                            <HoverCard withArrow>
                                                <HoverCard.Target>
                                                    <div>
                                                        <FaEdit
                                                            className={
                                                                classes.faEditIconPointer
                                                            }
                                                        />
                                                    </div>
                                                </HoverCard.Target>
                                                <HoverCard.Dropdown
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <Title order={5}>
                                                        {t(
                                                            "dispatchNote.setIdentifierTitle"
                                                        )}
                                                    </Title>
                                                    <Divider my="xs" />
                                                    <Grid>
                                                        <Grid.Col>
                                                            <NumberInput
                                                                value={
                                                                    identValue ??
                                                                    0
                                                                }
                                                                onChange={(
                                                                    val
                                                                ) => {
                                                                    setIdentValue(
                                                                        val
                                                                    );
                                                                }}
                                                                label={t(
                                                                    "dispatchNote.setIdentifierLabel"
                                                                )}
                                                                precision={10}
                                                                removeTrailingZeros
                                                            />
                                                        </Grid.Col>
                                                        <Grid.Col>
                                                            <Flex justify="space-between">
                                                                <Button
                                                                    color="teal"
                                                                    disabled={
                                                                        !isIdentNumber()
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            isIdentNumber()
                                                                        ) {
                                                                            const identifier =
                                                                                identValue as number;
                                                                            updateIdent.mutate(
                                                                                {
                                                                                    updateOptions:
                                                                                        {
                                                                                            identifier:
                                                                                                identifier,
                                                                                            idDataGroup:
                                                                                                dataGroupContextValue.selectedGroup ??
                                                                                                1,
                                                                                        },
                                                                                }
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {t(
                                                                        "dispatchNote.setButton"
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    color="red"
                                                                    onClick={() => {
                                                                        setIdentValue(
                                                                            data
                                                                                ?.dispatchNoteIdent
                                                                                .identifier
                                                                        );
                                                                    }}
                                                                >
                                                                    {t(
                                                                        "dispatchNote.resetButton"
                                                                    )}
                                                                </Button>
                                                            </Flex>
                                                        </Grid.Col>
                                                    </Grid>
                                                </HoverCard.Dropdown>
                                            </HoverCard>
                                        ) : (
                                            <></>
                                        )}
                                    </Flex>
                                }
                                placeholder={t(
                                    "dispatchNote.numericalIdentifier"
                                )}
                                precision={10}
                                removeTrailingZeros
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
                                <DateInput
                                    allowDeselect
                                    valueFormat="DD.MM.YYYY"
                                    locale={i18n.language}
                                    value={date}
                                    label={t("dispatchNote.issuingDate")}
                                    placeholder={t("dispatchNote.issuingDate")}
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
