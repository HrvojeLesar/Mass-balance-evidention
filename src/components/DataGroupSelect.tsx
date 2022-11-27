import { useContext, useMemo } from "react";
import { Card, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../DataGroupProvider";

export default function DataGroupSelect() {
    const { t } = useTranslation();
    const value = useContext(DataGroupContext);
    const isGroupsEmpty = useMemo(() => value.groups?.length === 0, [value]);
    return (
        <Form>
            <Form.Label>{t("dataGroup.dataGroupSelect").toString()}</Form.Label>
            <Form.Select
                value={value.selectedGroup}
                disabled={value.isLoading || isGroupsEmpty}
                onChange={(e) => {
                    if (value.selectGroup) {
                        value.selectGroup(Number(e.target.value));
                    }
                }}
            >
                {value.isLoading ? (
                    <option>{t("loading").toString()}</option>
                ) : isGroupsEmpty ? (
                    <option>{t("dataGroup.noGroups")}</option>
                ) : (
                    value.groups?.map((group) => {
                        return (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        );
                    })
                )}
            </Form.Select>
        </Form>
    );
}

export function DataGroupSelectFlex() {
    return (
        <div className="d-flex flex-row-reverse mb-2">
            <Card className="p-2 shadow">
                <DataGroupSelect />
            </Card>
        </div>
    );
}
