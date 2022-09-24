import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Buyer,
    BuyerInsertOptions,
    CellInsertOptions,
    Exact,
    InsertBuyerMutation,
    useInsertBuyerMutation,
    useInsertCellMutation,
} from "../../generated/graphql";
import { FaSave } from "react-icons/fa";
import BaseForm from "./BaseForm";
import { Dispatch, SetStateAction } from "react";

// type BuyerFormProps = {
//     onSuccess: (data: InsertBuyerMutation, variables: Exact<{ insertOptions: BuyerInsertOptions; }>, context: unknown) => unknown;
// }

export default function CellForm() {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
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
