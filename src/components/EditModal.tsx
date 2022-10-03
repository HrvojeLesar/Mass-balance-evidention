import { ReactNode } from "react";
import { Modal } from "react-bootstrap";

type EditModalProps = {
    children?: ReactNode;
    show: boolean;
    onHide: () => void;
    title?: string | ReactNode;
};

export default function EditModal({
    title,
    show,
    onHide,
    children,
}: EditModalProps) {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
        </Modal>
    );
}
