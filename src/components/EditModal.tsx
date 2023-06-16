import { Modal, Text } from "@mantine/core";
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
            title={<Text fz="lg" fw={700}>{title}</Text>}
            size="auto"
            // WARN: TEMP fix for modals not being center aligned
            styles={{
                inner: {
                    paddingLeft: "0px !important",
                    paddingRight: "0px !important"
                }
            }}
        >
            {children}
        </Modal>
    );
}
