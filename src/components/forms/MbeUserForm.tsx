import { Grid, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    MbeUserInsertOptions,
    useInsertUserMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";

type MbeUserFormProps = {
    onInsertSuccess?: () => void;
};

export default function MbeUserForm({ onInsertSuccess }: MbeUserFormProps) {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MbeUserInsertOptions>({
        mode: "onChange",
        defaultValues: {
            email: "",
        },
    });

    const insert = useInsertUserMutation({
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
                        {...register("email", {
                            required: t("dataGroup.errors.name"),
                        })}
                        label={"E-mail"}
                        placeholder={"E-mail"}
                        autoComplete="off"
                        withAsterisk
                        error={
                            errors.email
                                ? t("dataGroup.errors.name")
                                : undefined
                        }
                        spellCheck={false}
                    />
                </Grid.Col>
            </Grid>
        </BaseForm>
    );
}
