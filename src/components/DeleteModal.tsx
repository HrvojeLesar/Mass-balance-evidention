import { Button, Divider, Flex, Modal, Title } from "@mantine/core";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type DeleteModalProps = {
    show: boolean;
    onHide: () => void;
    title?: string | ReactNode;
    deleteFn: () => void;
    isLoading: boolean;
    errorMsg: ReactNode | string | undefined;
};

export default function DeleteModal({
    title,
    show,
    onHide,
    isLoading,
    deleteFn,
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
            title={<Title order={4}>{title}</Title>}
            size="auto"
        >
            {t("deleteModal.deleteConfirmText").toString()}
            <Divider my="sm" />
            <Flex justify="end" gap="sm">
                <Button color="gray" onClick={onHide} disabled={isLoading}>
                    {t("deleteModal.cancelButton").toString()}
                </Button>
                <Button color="red" onClick={deleteFn} disabled={isLoading}>
                    {t("deleteModal.confirmButton").toString()}
                </Button>
            </Flex>
        </Modal>
    );
}
