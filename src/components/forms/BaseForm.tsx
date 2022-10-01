import { FormEventHandler, ReactNode } from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaSave } from "react-icons/fa";

type BaseFormProps = {
    onSubmit: FormEventHandler<HTMLFormElement>;
    children: ReactNode;
    submitDisabled?: boolean;
    customSubmit?: boolean;
};

export default function BaseForm({
    onSubmit,
    children,
    submitDisabled,
}: BaseFormProps) {
    const { t } = useTranslation();
    return (
        <Form onSubmit={onSubmit}>
            {children}
            <Button
                variant="success"
                type="submit"
                className="d-flex align-items-center"
                disabled={submitDisabled}
            >
                <FaSave className="me-1" />
                {t("save")}
            </Button>
        </Form>
    );
}
