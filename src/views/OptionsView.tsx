import { useContext, useMemo } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import DataGroupSelect from "../components/DataGroupSelect";
import DataGroupForm from "../components/forms/DataGroupForm";
import { DataGroupContext } from "../DataGroupProvider";

export default function OptionsView() {
    const { t } = useTranslation();
    const value = useContext(DataGroupContext);

    const editValue = useMemo(() => {
        return value.groups.find((group) => group.id === value.selectedGroup);
    }, [value]);

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
        </Row>
    );
}
