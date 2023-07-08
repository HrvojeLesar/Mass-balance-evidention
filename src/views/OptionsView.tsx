import { Divider, Grid, Title, Flex, ActionIcon, Box } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaEdit } from "react-icons/fa";
import DataGroupSelect from "../components/DataGroupSelect";
import DataGroupForm from "../components/forms/DataGroupForm";
import NotSelectedOverlay, {
    BuiltInNotSelected,
} from "../components/NotSelectedOverlay";
import CardUtil from "../components/util/CardUtil";
import { DataGroupContext } from "../DataGroupProvider";
import { MbeGroupContext } from "../MbeGroupProvider";

export default function OptionsView() {
    const { t } = useTranslation();
    const dataGroupContextValue = useContext(DataGroupContext);

    const [editToggleValue, editToggle] = useToggle();

    const editValue = useMemo(() => {
        return dataGroupContextValue.groups?.find(
            (group) => group.id === dataGroupContextValue.selectedGroup
        );
    }, [dataGroupContextValue]);

    const { selectedGroup: mbeGroupId } = useContext(MbeGroupContext);

    return (
        <Box pos="relative">
            <NotSelectedOverlay
                dataGroupId={mbeGroupId}
                builtInType={BuiltInNotSelected.MbeGroup}
            />
            <Grid>
                <Grid.Col sm={12} md={6} lg={6}>
                    <CardUtil>
                        {mbeGroupId && (
                            <NotSelectedOverlay
                                dataGroupId={
                                    dataGroupContextValue.selectedGroup
                                }
                            />
                        )}
                        <Flex justify="space-between">
                            <Title order={4}>
                                {t("titles.dataGroupSelect").toString()}
                            </Title>
                            {dataGroupContextValue.selectedGroup && (
                                <ActionIcon
                                    color="yellow"
                                    variant={
                                        editToggleValue ? "filled" : "outline"
                                    }
                                    onClick={() => {
                                        editToggle();
                                    }}
                                    title={t("titles.edit")}
                                >
                                    <FaEdit />
                                </ActionIcon>
                            )}
                        </Flex>
                        <Divider my="xs" />
                        <DataGroupSelect />
                        {editValue && editToggleValue ? (
                            <>
                                <Divider my="xs" />
                                <Title order={4}>
                                    {t("titles.editDataGroup").toString()}
                                </Title>
                                <Divider my="xs" />
                                <DataGroupForm
                                    edit={editValue}
                                    onUpdateSuccess={() => {
                                        if (dataGroupContextValue.refetch) {
                                            dataGroupContextValue.refetch();
                                        }
                                    }}
                                />
                            </>
                        ) : (
                            <></>
                        )}
                    </CardUtil>
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <CardUtil>
                        <Title order={4}>
                            {t("titles.newDataGroup").toString()}
                        </Title>
                        <Divider my="xs" />
                        <DataGroupForm
                            onInsertSuccess={() => {
                                if (dataGroupContextValue.refetch) {
                                    dataGroupContextValue.refetch();
                                }
                            }}
                        />
                    </CardUtil>
                </Grid.Col>
            </Grid>
        </Box>
    );
}
