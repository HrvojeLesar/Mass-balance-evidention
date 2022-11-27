import { useContext, useMemo, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import DataGroupSelect from "../components/DataGroupSelect";
import DataGroupForm from "../components/forms/DataGroupForm";
import MigrateModal from "../components/MigrateModal";
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
        <Row className="my-4">
            <Col md>
                <Card className="p-2 shadow mb-4">
                    <div className="h5 mb-1">
                        {t("titles.dataGroupSelect").toString()}
                    </div>
                    <div className="divider"></div>
                    <DataGroupSelect />
                </Card>
            </Col>
            <Col md>
                <Card className="p-2 shadow mb-4">
                    <div className="h5 mb-1">
                        {t("titles.newDataGroup").toString()}
                    </div>
                    <div className="divider"></div>
                    <DataGroupForm
                        onInsertSuccess={() => {
                            if (value.refetch) {
                                value.refetch();
                            }
                        }}
                    />
                </Card>
            </Col>
            {editValue && (
                <Col md>
                    <Card className="p-2 shadow mb-4">
                        <div className="h5 mb-1">
                            {t("titles.editDataGroup").toString()}
                        </div>
                        <div className="divider"></div>
                        <DataGroupForm
                            edit={editValue}
                            onUpdateSuccess={() => {
                                if (value.refetch) {
                                    value.refetch();
                                }
                            }}
                        />
                    </Card>
                </Col>
            )}
            {displayImport && (
                <Col md>
                    <Card className="p-2 shadow mb-4">
                        <div className="h5 mb-1">
                            {t("titles.migrationModalTitle").toString()}
                        </div>
                        <div className="divider"></div>
                        <MigrateModal
                            show={isMigrateModalShown}
                            onHide={() => {
                                setIsMigrateModalShown(false);
                            }}
                        />
                        <div className="mb-2">{t("migration.optionText")}</div>
                        <Button
                            variant="danger"
                            onClick={() => {
                                setIsMigrateModalShown(true);
                            }}
                        >
                            {t("migration.start")}
                        </Button>
                    </Card>
                </Col>
            )}
        </Row>
    );
}
