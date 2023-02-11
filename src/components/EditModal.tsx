import { Modal, Title } from "@mantine/core";
import { ReactNode } from "react";

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
        <Modal
            opened={show}
            onClose={onHide}
            centered
            title={<Title order={4}>{title}</Title>}
            size="auto"
        >
            {children}
        </Modal>
    );
}
