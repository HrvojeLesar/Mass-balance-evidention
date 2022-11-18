import { ReactNode } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

type DeleteModalProps = {
    show: boolean;
    onHide: () => void;
    title?: string | ReactNode;
    deleteFn: () => void;
    isLoading: boolean;
    errorMsg: ReactNode | string | undefined;
};

export default function EditModal({
    title,
    show,
    onHide,
    isLoading,
    deleteFn,
}: DeleteModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            show={show}
            onHide={isLoading ? undefined : onHide}
            centered
            backdrop={isLoading ? "static" : true}
            keyboard={isLoading ? false : true}
        >
            <Modal.Header closeButton={!isLoading}>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {t("deleteModal.deleteConfirmText").toString()}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onHide}
                    disabled={isLoading}
                >
                    {t("deleteModal.cancelButton").toString()}
                </Button>
                <Button
                    variant="danger"
                    onClick={deleteFn}
                    disabled={isLoading}
                >
                    {t("deleteModal.confirmButton").toString()}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
