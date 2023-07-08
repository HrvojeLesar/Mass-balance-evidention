import { Overlay, Text } from "@mantine/core";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type NotSelectedOverlayProps = {
    dataGroupId: number | undefined;
    builtInType?: BuiltInNotSelected;
    children?: ReactNode;
};

export enum BuiltInNotSelected {
    DataGroup,
    MbeGroup,
}

export default function NotSelectedOverlay({
    dataGroupId,
    builtInType = BuiltInNotSelected.DataGroup,
    children,
}: NotSelectedOverlayProps) {
    const { t } = useTranslation();

    return !dataGroupId ? (
        <Overlay blur={5} center radius="md">
            {builtInType === BuiltInNotSelected.DataGroup ? (
                <Text>{t("missing.dataGroup")}</Text>
            ) : builtInType === BuiltInNotSelected.MbeGroup ? (
                <Text>{t("missing.mbeGroup")}</Text>
            ) : (
                children ?? <></>
            )}
        </Overlay>
    ) : (
        <></>
    );
}
