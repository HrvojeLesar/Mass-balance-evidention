import { Divider, Grid, Select, Title } from "@mantine/core";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

    // TODO: Attatch this function to context instead
    const isGroupsEmpty = useMemo(
        () => mbeGroupContextValue.groups?.length === 0,
        [mbeGroupContextValue]
    );

    // TODO: Decouple changing group globally in every context (maybe)
    return (
        <Grid>
            <Grid.Col sm={12} md={6} lg={6}>
                <CardUtil>
                    <Title order={4}>{t("titles.mbeGroupSelection")}</Title>
                    <Divider my="xs" />
                    <Select
                        label={t("mbeGroupMember.group")}
                        value={
                            mbeGroupContextValue.selectedGroup
                                ? mbeGroupContextValue.selectedGroup.toString()
                                : undefined
                        }
                        disabled={
                            mbeGroupContextValue.isLoading || isGroupsEmpty
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
                </CardUtil>
            </Grid.Col>

            <Grid.Col sm={12} md={6} lg={6}>
                <CardUtil>
                    <Title order={4}>{t("titles.mbeUserInsert")}</Title>
                    <Divider my="xs" />
                    <MbeUserForm
                        onInsertSuccess={() => {
                            if (dataGroupContextValue.refetch) {
                                dataGroupContextValue.refetch();
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
