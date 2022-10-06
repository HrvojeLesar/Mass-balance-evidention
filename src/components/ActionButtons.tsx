import { Button, ButtonGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaEdit, FaTrash } from "react-icons/fa";

type ActionButtonsProps = {
    editFn?: () => void;
    deleteFn?: () => void;
};

export default function ActionButtons({
    editFn,
    deleteFn,
}: ActionButtonsProps) {
    const { t } = useTranslation();
    return (
        <ButtonGroup>
            <Button
                onClick={editFn}
                variant="warning"
                className="actions-button"
                title={t("titles.edit").toString()}
            >
                <FaEdit />
            </Button>
            <Button
                onClick={deleteFn}
                variant="danger"
                className="actions-button"
                title={t("titles.delete").toString()}
            >
                <FaTrash />
            </Button>
        </ButtonGroup>
    );
}
