import { ActionIcon, Divider, Flex, Text } from "@mantine/core";
import {
    QueryObserverResult,
    RefetchOptions,
    RefetchQueryFilters,
} from "@tanstack/react-query";
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";
import { AuthContext } from "../AuthProvider";
import {
    GetGroupMembersQuery,
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
    const authContext = useContext(AuthContext);

    return (
        <>
            <Flex align="center" justify="space-between">
                <Flex align="center" gap="md">
                    <Text fz="md" fw={700}>{`${position}.`}</Text>
                    <div>
                        <Text fz="xs" c="dimmed">
                            {t("membersDisplay.email")}
                        </Text>
                        <Text
                            fz="sm"
                            color={
                                email.toLowerCase() ===
                                authContext.email?.toLowerCase()
                                    ? "orange"
                                    : undefined
                            }
                        >
                            {email}
                        </Text>
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
    data: GetGroupMembersQuery | undefined;
    refetch: <TPageData>(
        options?: RefetchOptions & RefetchQueryFilters<TPageData>
    ) => Promise<QueryObserverResult<unknown, unknown>>;
};

export default function MembersDisplay({
    idMbeGroup,
    data,
    refetch,
}: MemberDisplayProps) {
    const { t } = useTranslation();

    const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<string | undefined>(
        undefined
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
