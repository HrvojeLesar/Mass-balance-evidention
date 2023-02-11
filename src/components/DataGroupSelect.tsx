import { Select } from "@mantine/core";
import { useContext, useMemo } from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../DataGroupProvider";
import CardUtil from "./util/CardUtil";

export default function DataGroupSelect() {
    const { t } = useTranslation();
    const value = useContext(DataGroupContext);
    const isGroupsEmpty = useMemo(() => value.groups?.length === 0, [value]);
    return (
        <Form>
            <Select
                label={t("dataGroup.dataGroupSelect").toString()}
                value={
                    value.selectedGroup
                        ? value.selectedGroup.toString()
                        : undefined
                }
                disabled={value.isLoading || isGroupsEmpty}
                onChange={(val) => {
                    if (value.selectGroup !== undefined) {
                        value.selectGroup(Number(val));
                    }
                }}
                data={
                    value.isLoading
                        ? [{ value: "loading", label: t("loading").toString() }]
                        : value.groups?.map((group) => ({
                              value: group.id.toString(),
                              label: group.name,
                          })) ?? []
                }
            />
        </Form>
    );
}

export function DataGroupSelectFlex() {
    return (
        <div className="d-flex flex-row-reverse mb-2">
            <CardUtil>
                <DataGroupSelect />
            </CardUtil>
        </div>
    );
}
