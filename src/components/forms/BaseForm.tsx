import { Button } from "@mantine/core";
import { FormEventHandler, ReactNode } from "react";
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
        <form onSubmit={onSubmit}>
            {children}
            <Button
                color="teal"
                type="submit"
                // className="d-flex align-items-center"
                disabled={submitDisabled}
                leftIcon={<FaSave />}
                title={t("save")}
            >
                {t("save")}
            </Button>
        </form>
    );
}
