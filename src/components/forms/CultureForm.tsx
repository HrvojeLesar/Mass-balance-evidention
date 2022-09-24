import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Buyer,
    BuyerInsertOptions,
    CellInsertOptions,
    CultureInsertOptions,
    Exact,
    InsertBuyerMutation,
    useInsertBuyerMutation,
    useInsertCellMutation,
    useInsertCultureMutation,
} from "../../generated/graphql";
import { FaSave } from "react-icons/fa";
import BaseForm from "./BaseForm";
import { Dispatch, SetStateAction } from "react";

export default function CultureForm() {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CultureInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: "",
            description: "",
        },
        shouldUnregister: true,
    });
    const insert = useInsertCultureMutation(
        { endpoint: "http://localhost:8000/graphiql" },
        {
            // onSuccess,
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
                        <Form.Label>{t("culture.name")}*</Form.Label>
                        <Form.Control
                            {...register("name", {
                                required: t("culture.errors.name"),
                            })}
                            type="input"
                            placeholder={t("culture.name")}
                            autoComplete="off"
                            isInvalid={errors.name !== undefined}
                        />
                        <Form.Control.Feedback type="invalid">
                            {t("culture.errors.name")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>{t("culture.description")}</Form.Label>
                        <Form.Control
                            {...register("description", {})}
                            type="input"
                            placeholder={t("culture.description")}
                            autoComplete="off"
                        />
                    </Form.Group>
                </Col>
            </Row>
        </BaseForm>
    );
}
