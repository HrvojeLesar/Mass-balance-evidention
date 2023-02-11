import { Button, Divider, Grid, Title, Text } from "@mantine/core";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DataGroupSelect from "../components/DataGroupSelect";
import DataGroupForm from "../components/forms/DataGroupForm";
import MigrateModal from "../components/MigrateModal";
import CardUtil from "../components/util/CardUtil";
import { DataGroupContext } from "../DataGroupProvider";

export default function OptionsView() {
    const { t } = useTranslation();
    const value = useContext(DataGroupContext);

    const [isMigrateModalShown, setIsMigrateModalShown] = useState(false);

    const editValue = useMemo(() => {
        return value.groups?.find((group) => group.id === value.selectedGroup);
    }, [value]);

    const displayImport = useMemo(() => {
        return window.__TAURI__ !== undefined;
    }, []);

    return (
        <>
            <Grid>
                <Grid.Col sm={12} md={6} lg={6}>
                    <CardUtil>
                        <Title order={4}>
                            {t("titles.dataGroupSelect").toString()}
                        </Title>
                        <Divider my="xs" />
                        <DataGroupSelect />
                        {editValue && (
                            <>
                                <Divider my="xs" />
                                <Title order={4}>
                                    {t("titles.editDataGroup").toString()}
                                </Title>
                                <Divider my="xs" />
                                <DataGroupForm
                                    edit={editValue}
                                    onUpdateSuccess={() => {
                                        if (value.refetch) {
                                            value.refetch();
                                        }
                                    }}
                                />
                            </>
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
                                if (value.refetch) {
                                    value.refetch();
                                }
                            }}
                        />
                    </CardUtil>
                </Grid.Col>
                {displayImport && (
                    <Grid.Col sm={12} md={6} lg={6}>
                        <CardUtil>
                            <Title order={4}>
                                {t("titles.migrationModalTitle").toString()}
                            </Title>
                            <Divider my="xs" />
                            <MigrateModal
                                show={isMigrateModalShown}
                                onHide={() => {
                                    setIsMigrateModalShown(false);
                                }}
                            />
                            <Text>{t("migration.optionText")}</Text>
                            <Button
                                color="red"
                                onClick={() => {
                                    setIsMigrateModalShown(true);
                                }}
                            >
                                {t("migration.start")}
                            </Button>
                        </CardUtil>
                    </Grid.Col>
                )}
            </Grid>
        </>
    );
}
