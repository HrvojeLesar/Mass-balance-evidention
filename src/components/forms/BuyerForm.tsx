import { Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    BuyerInsertOptions,
    InsertBuyerMutation,
    useInsertBuyerMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormSuccessCallback } from "./FormUtils";

export default function BuyerForm({
    onSuccess,
}: FormSuccessCallback<InsertBuyerMutation, BuyerInsertOptions>) {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BuyerInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: "",
            address: "",
            contact: "",
        },
    });

    const insert = useInsertBuyerMutation(
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
                        <Form.Label>{t("buyer.name")}*</Form.Label>
                        <Form.Control
                            {...register("name", {
                                required: t("buyer.errors.name"),
                            })}
                            type="input"
                            placeholder={t("buyer.name")}
                            autoComplete="off"
                            isInvalid={errors.name !== undefined}
                        />
                        <Form.Control.Feedback type="invalid">
                            {t("buyer.errors.name")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            {/* <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>{t("buyer.address")}</Form.Label>
                        <Form.Control
                            {...register("address", {})}
                            type="input"
                            placeholder={t("buyer.address")}
                            autoComplete="off"
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>{t("buyer.contact")}</Form.Label>
                        <Form.Control
                            {...register("contact", {})}
                            type="input"
                            placeholder={t("buyer.contact")}
                            autoComplete="off"
                        />
                    </Form.Group>
                </Col>
            </Row> */}
        </BaseForm>
    );
}
