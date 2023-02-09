import { useContext } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Culture,
    CultureInsertOptions,
    CultureUpdateOptions,
    InsertCultureMutation,
    UpdateCultureMutation,
    useInsertCultureMutation,
    useUpdateCultureMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";

export default function CultureForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    Culture,
    InsertCultureMutation,
    CultureInsertOptions,
    UpdateCultureMutation,
    CultureUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CultureInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
        },
    });

    const insert = useInsertCultureMutation({
        onSuccess: (data, variables, context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateCultureMutation({
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
                {/* <Col>
                    <Form.Group>
                        <Form.Label>{t("culture.description")}</Form.Label>
                        <Form.Control
                            {...register("description", {})}
                            type="input"
                            placeholder={t("culture.description")}
                            autoComplete="off"
                        />
                    </Form.Group>
                </Col> */}
            </Row>
        </BaseForm>
    );
}
