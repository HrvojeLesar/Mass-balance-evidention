import { ActionIcon, Divider, Flex, Text } from "@mantine/core";
import { Fragment, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";
import {
    useGetGroupMembersQuery,
    useRemoveMbeGroupMemberMutation,
} from "../generated/graphql";
import DeleteModal from "./DeleteModal";
import displayOnErrorNotification from "./util/deleteNotificationUtil";

type MemberProps = {
    position: number;
    email: string;
    openModal: (email: string) => void;
};

function Member({ position, email, openModal }: MemberProps) {
    const { t } = useTranslation();
    return (
        <>
            <Flex align="center" justify="space-between">
                <Flex align="center" gap="md">
                    <Text fz="md" fw={700}>{`${position}.`}</Text>
                    <div>
                        <Text fz="xs" c="dimmed">
                            {t("membersDisplay.email")}
                        </Text>
                        <Text fz="sm">{email}</Text>
                    </div>
                </Flex>
                <ActionIcon
                    onClick={() => {
                        openModal(email);
                    }}
                    color="red"
                    variant="filled"
                    title={t("titles.delete").toString()}
                >
                    <FaTrash />
                </ActionIcon>
            </Flex>
        </>
    );
}

type MemberDisplayProps = {
    idMbeGroup: number;
};

export default function MembersDisplay({ idMbeGroup }: MemberDisplayProps) {
    const { t } = useTranslation();

    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<string | undefined>(
        undefined
    );
    const { data, refetch, isInitialLoading } = useGetGroupMembersQuery(
        {
            options: {
                idMbeGroup,
            },
        },
        {
            queryKey: ["getGroupMembers", idMbeGroup],
            keepPreviousData: true,
        }
    );

    const members = useMemo(() => {
        return data !== undefined
            ? [...data.mbeGroupMembers].sort((a, b) => a.idUser - b.idUser)
            : [];
    }, [data]);

    const remove = useRemoveMbeGroupMemberMutation({
        onError: () => {
            displayOnErrorNotification();
        },
        onSuccess: (_data, _variables, _context) => {
            refetch();
            setIsDeleteModalShown(false);
        },
    });

    const removeMember = useCallback(
        (email: string) => {
            remove.mutate({
                options: {
                    idMbeGroup,
                    memberEmail: email,
                },
            });
        },
        [remove, idMbeGroup]
    );

    return (
        <>
            <DeleteModal
                title={t("titles.delete").toString()}
                show={isDeleteModalShown}
                onHide={() => setIsDeleteModalShown(false)}
                isLoading={remove.isLoading}
                errorMsg={undefined}
                deleteFn={() => {
                    if (selectedEmail) {
                        removeMember(selectedEmail);
                    }
                }}
                deleteConfirmText={t("mbeGroupMemberDeletion.confirmationText")}
                confirmText={t("mbeGroupMemberDeletion.confirmButtonText")}
            />
            {members.length > 0 ? (
                members.map((member, idx) => {
                    return (
                        <Fragment key={member.idUser}>
                            {idx !== 0 ? (
                                <Divider my="xs" variant="dashed" />
                            ) : (
                                <></>
                            )}
                            <Member
                                position={idx + 1}
                                email={member.email}
                                openModal={() => {
                                    setSelectedEmail(member.email);
                                    setIsDeleteModalShown(true);
                                }}
                            />
                        </Fragment>
                    );
                })
            ) : (
                <Text>No members to display</Text>
            )}
        </>
    );
}
