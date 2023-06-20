import { notifications } from "@mantine/notifications";
import i18n from "i18next";
import { ReactNode } from "react";

const displayOnErrorNotification = (message?: ReactNode) => {
    notifications.show({
        title: i18n.t("notificationMessages.title").toString(),
        color: "red",
        message: message ?? "",
    });
};

export default displayOnErrorNotification;
