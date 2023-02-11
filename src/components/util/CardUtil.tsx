import { Paper } from "@mantine/core";
import { ReactNode } from "react";

type CardUtil = {
    children?: ReactNode;
};

export default function EditModal({ children }: CardUtil) {
    return (
        <Paper
            radius="md"
            shadow="xs"
            p="sm"
            withBorder
            sx={() => ({ overflow: "hidden" })}
        >
            {children}
        </Paper>
    );
}
