import { Flex, Select } from "@mantine/core";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { DataGroupContext } from "../DataGroupProvider";
import CardUtil from "./util/CardUtil";

export default function DataGroupSelect() {
    const { t } = useTranslation();
    const value = useContext(DataGroupContext);
    return (
        <Select
            label={t("dataGroup.dataGroupSelect").toString()}
            value={
                value.selectedGroup ? value.selectedGroup.toString() : undefined
            }
            disabled={value.isLoading || value.isEmpty}
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
            withinPortal
        />
    );
}

export function DataGroupSelectFlex() {
    return (
        <Flex direction="row-reverse" mb="sm">
            <CardUtil>
                <DataGroupSelect />
            </CardUtil>
        </Flex>
    );
}
