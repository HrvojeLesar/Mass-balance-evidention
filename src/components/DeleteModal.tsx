import { Button, Divider, Flex, Modal, Title, Text } from "@mantine/core";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type DeleteModalProps = {
    show: boolean;
    onHide: () => void;
    title?: string | ReactNode;
    deleteFn: () => void;
    isLoading: boolean;
    errorMsg: ReactNode | string | undefined;
    deleteConfirmText?: string;
    cancelText?: string;
    confirmText?: string;
};

export default function DeleteModal({
    title,
    show,
    onHide,
    isLoading,
    deleteFn,
    deleteConfirmText,
    cancelText,
    confirmText,
}: DeleteModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={show}
            onClose={() => {
                if (!isLoading) {
                    onHide();
                }
            }}
            centered
            closeOnClickOutside={isLoading ? false : true}
            closeOnEscape={isLoading ? false : true}
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
            <Text>
                {deleteConfirmText ??
                    t("deleteModal.deleteConfirmText").toString()}
            </Text>
            <Divider my="sm" />
            <Flex justify="end" gap="sm">
                <Button color="gray" onClick={onHide} disabled={isLoading}>
                    {cancelText ?? t("deleteModal.cancelButton").toString()}
                </Button>
                <Button color="red" onClick={deleteFn} disabled={isLoading}>
                    {confirmText ?? t("deleteModal.confirmButton").toString()}
                </Button>
            </Flex>
        </Modal>
    );
}
