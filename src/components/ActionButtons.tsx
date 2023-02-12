import { ActionIcon, Flex } from "@mantine/core";
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
        <Flex gap="xs">
            <ActionIcon
                onClick={editFn}
                color="yellow"
                variant="filled"
                title={t("titles.edit").toString()}
            >
                <FaEdit />
            </ActionIcon>
            <ActionIcon
                onClick={deleteFn}
                color="red"
                variant="filled"
                title={t("titles.delete").toString()}
            >
                <FaTrash />
            </ActionIcon>
        </Flex>
    );
}
