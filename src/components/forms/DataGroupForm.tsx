import { useEffect } from "react";
import { Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    DataGroup,
    DataGroupInsertOptions,
    useInsertDataGroupMutation,
    useUpdateDataGroupMutation,
} from "../../generated/graphql";
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
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DataGroupInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
        },
    });

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
            <Row className="mb-3">
                <Form.Group>
                    <Form.Label>{t("dataGroup.name")}*</Form.Label>
                    <Form.Control
                        {...register("name", {
                            required: t("dataGroup.errors.name"),
                        })}
                        type="input"
                        placeholder={t("dataGroup.name")}
                        autoComplete="off"
                        isInvalid={errors.name !== undefined}
                    />
                    <Form.Control.Feedback type="invalid">
                        {t("culture.errors.name")}
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>
            <Row className="mb-3">
                <Form.Group>
                    <Form.Label>{t("dataGroup.description")}</Form.Label>
                    <Form.Control
                        {...register("description", {})}
                        type="input"
                        placeholder={t("dataGroup.description")}
                        autoComplete="off"
                    />
                </Form.Group>
            </Row>
        </BaseForm>
    );
}
