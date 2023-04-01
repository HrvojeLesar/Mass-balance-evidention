import { Grid, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    MbeGroup,
    MbeGroupInsertOptions,
    useInsertMbeGroupMutation,
} from "../../generated/graphql";
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

    const insert = useInsertMbeGroupMutation({
        onSuccess: (_data, _variables, _context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess();
            }
        },
    });

    // TODO: Updateing
    // const update = useUpdateDataGroupMutation({
    //     onSuccess: (_data, _variables, _context) => {
    //         // WARN: causes flickering input text on save
    //         // reset();
    //         if (onUpdateSuccess) {
    //             onUpdateSuccess();
    //         }
    //     },
    // });

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
                        {...register("name", {
                            required: t("dataGroup.errors.name"),
                        })}
                        label={t("newMbeGroup.name")}
                        placeholder={t("newMbeGroup.name")}
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
