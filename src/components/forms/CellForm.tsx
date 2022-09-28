import { Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    CellInsertOptions,
    InsertCellMutation,
    useInsertCellMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormSuccessCallback } from "./FormUtils";

export default function CellForm({
    onSuccess,
}: FormSuccessCallback<InsertCellMutation, CellInsertOptions>) {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CellInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: "",
            description: "",
        },
        shouldUnregister: true,
    });
    const insert = useInsertCellMutation(
        {
            onSuccess: (data, variables, context) => {
                reset();
                onSuccess(data, variables, context);
            },
        }
    );

    return (
        <BaseForm
            onSubmit={handleSubmit((data) => {
                insert.mutate({ insertOptions: data });
            })}
        >
            <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>{t("cell.name")}*</Form.Label>
                        <Form.Control
                            {...register("name", {
                                required: t("cell.errors.name"),
                            })}
                            type="input"
                            placeholder={t("cell.name")}
                            autoComplete="off"
                            isInvalid={errors.name !== undefined}
                        />
                        <Form.Control.Feedback type="invalid">
                            {t("cell.errors.name")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>{t("cell.description")}</Form.Label>
                        <Form.Control
                            {...register("description", {})}
                            type="input"
                            placeholder={t("cell.description")}
                            autoComplete="off"
                        />
                    </Form.Group>
                </Col>
            </Row>
        </BaseForm>
    );
}
