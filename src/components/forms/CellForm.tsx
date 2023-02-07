import { useContext } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../../DataGroupProvider";
import {
    Cell,
    CellInsertOptions,
    CellUpdateOptions,
    InsertCellMutation,
    UpdateCellMutation,
    useInsertCellMutation,
    useUpdateCellMutation,
} from "../../generated/graphql";
import BaseForm from "./BaseForm";
import { FormProps } from "./FormUtils";

export default function CellForm({
    edit,
    onInsertSuccess,
    onUpdateSuccess,
}: FormProps<
    Cell,
    InsertCellMutation,
    CellInsertOptions,
    UpdateCellMutation,
    CellUpdateOptions
>) {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CellInsertOptions>({
        mode: "onChange",
        defaultValues: {
            name: edit?.name ?? "",
            description: edit?.description ?? "",
        },
        // shouldUnregister: true,
    });

    const insert = useInsertCellMutation({
        onSuccess: (data, variables, context) => {
            reset();
            if (onInsertSuccess) {
                onInsertSuccess(data, variables, context);
            }
        },
    });

    const update = useUpdateCellMutation({
        onSuccess: (data, variables, context) => {
            reset();
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
                              options: { ...data, id: edit.id },
                          });
                      })
                    : handleSubmit((data) => {
                          insert.mutate({
                              options: {
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
                {/* <Col>
                    <Form.Group>
                        <Form.Label>{t("cell.description")}</Form.Label>
                        <Form.Control
                            {...register("description", {})}
                            type="input"
                            placeholder={t("cell.description")}
                            autoComplete="off"
                        />
                    </Form.Group>
                </Col> */}
            </Row>
        </BaseForm>
    );
}
