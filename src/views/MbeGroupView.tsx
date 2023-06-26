import { ActionIcon, Divider, Flex, Grid, Select, Title } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaEdit } from "react-icons/fa";
import MbeGroupForm from "../components/forms/MbeGroupForm";
import MbeGroupMemberForm from "../components/forms/MbeGroupMemberForm";
import MbeUserForm from "../components/forms/MbeUserForm";
import MembersDisplay from "../components/MembersDisplay";
import CardUtil from "../components/util/CardUtil";
import { DataGroupContext } from "../DataGroupProvider";
import { MbeGroupContext } from "../MbeGroupProvider";

export default function MbeGroupView() {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);
    const mbeGroupContextValue = useContext(MbeGroupContext);

    const [editToggleValue, editToggle] = useToggle();

    const selectedGroup = useMemo(() => {
        return mbeGroupContextValue.groups?.find(
            (group) => group.id === mbeGroupContextValue.selectedGroup
        );
    }, [mbeGroupContextValue]);

    // TODO: Decouple changing group globally in every context (maybe)
    return (
        <Grid>
            <Grid.Col sm={12} md={6} lg={6}>
                <CardUtil>
                    <Flex justify="space-between">
                        <Title order={4}>{t("titles.mbeGroupSelection")}</Title>
                        <ActionIcon
                            color="yellow"
                            variant={editToggleValue ? "filled" : "outline"}
                            onClick={() => {
                                editToggle();
                            }}
                            title={t("titles.edit")}
                        >
                            <FaEdit />
                        </ActionIcon>
                    </Flex>
                    <Divider my="xs" />
                    <Select
                        label={t("mbeGroupMember.group")}
                        value={
                            mbeGroupContextValue.selectedGroup
                                ? mbeGroupContextValue.selectedGroup.toString()
                                : undefined
                        }
                        disabled={
                            mbeGroupContextValue.isLoading ||
                            mbeGroupContextValue.isEmpty
                        }
                        onChange={(val) => {
                            if (
                                mbeGroupContextValue.selectGroup !== undefined
                            ) {
                                mbeGroupContextValue.selectGroup(Number(val));
                            }
                        }}
                        data={
                            mbeGroupContextValue.isLoading
                                ? [
                                      {
                                          value: "loading",
                                          label: t("loading").toString(),
                                      },
                                  ]
                                : mbeGroupContextValue.groups?.map((group) => ({
                                      value: group.id.toString(),
                                      label: group.name,
                                  })) ?? []
                        }
                    />
                    {!mbeGroupContextValue.isEmpty && editToggleValue && (
                        <>
                            <Divider my="xs" />
                            <Title order={4}>
                                {t("titles.editMbeDataGroup").toString()}
                            </Title>
                            <Divider my="xs" />
                            <MbeGroupForm
                                edit={selectedGroup}
                                onUpdateSuccess={() => {
                                    if (mbeGroupContextValue.refetch) {
                                        mbeGroupContextValue.refetch();
                                    }
                                }}
                            />
                        </>
                    )}
                </CardUtil>
            </Grid.Col>

            <Grid.Col sm={12} md={6} lg={6}>
                <CardUtil>
                    <Title order={4}>{t("titles.mbeUserInsert")}</Title>
                    <Divider my="xs" />
                    <MbeUserForm
                        onInsertSuccess={() => {
                            if (mbeGroupContextValue.refetch) {
                                mbeGroupContextValue.refetch();
                            }
                        }}
                    />
                </CardUtil>
            </Grid.Col>

            <Grid.Col sm={12} md={6} lg={6}>
                <CardUtil>
                    <Title order={4}>{t("titles.newMbeGroup")}</Title>
                    <Divider my="xs" />
                    <MbeGroupForm
                        onInsertSuccess={() => {
                            if (mbeGroupContextValue.refetch) {
                                mbeGroupContextValue.refetch();
                            }
                        }}
                    />
                </CardUtil>
            </Grid.Col>

            <Grid.Col sm={12} md={6} lg={6}>
                <CardUtil>
                    <Title order={4}>{t("titles.newMbeGroupMember")}</Title>
                    <Divider my="xs" />
                    <MbeGroupMemberForm
                        onInsertSuccess={() => {
                            if (mbeGroupContextValue.refetch) {
                                mbeGroupContextValue.refetch();
                            }
                        }}
                    />
                </CardUtil>
            </Grid.Col>

            {mbeGroupContextValue.selectedGroup && (
                <Grid.Col sm={12} md={6} lg={6}>
                    <CardUtil>
                        <Title order={4}>{t("titles.membersDisplay")}</Title>
                        <Divider my="xs" />
                        <MembersDisplay
                            idMbeGroup={mbeGroupContextValue.selectedGroup}
                        />
                    </CardUtil>
                </Grid.Col>
            )}
        </Grid>
    );
}
