import {
    Button,
    Center,
    createStyles,
    Divider,
    Flex,
    Paper,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const authorize = async (code: string): Promise<AxiosResponse<any, any>> => {
    return axios.post(
        import.meta.env.VITE_MANUAL_AUTH,
        {
            code,
        },
        {
            withCredentials: true,
        }
    );
};

const useStyles = createStyles((theme) => ({
    background: {
        [theme.fn.largerThan("lg")]: {
            width: "25vw",
        },
        [theme.fn.smallerThan("lg")]: {
            width: "40vw",
        },
        [theme.fn.smallerThan("xs")]: {
            width: "50vw",
        },
    },
}));

export default function LoginCodeInsert() {
    const { t } = useTranslation();
    const { classes } = useStyles();
    const navigate = useNavigate();

    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Center>
            <Paper
                radius="md"
                shadow="xs"
                p="sm"
                withBorder
                sx={() => ({ overflow: "hidden" })}
                className={classes.background}
            >
                <Title order={4}>{t("titles.manualLogin")}</Title>
                <Divider my="xs" />
                <Text mb="xs">{t("manualLogin.message")}</Text>
                <Textarea
                    required
                    value={value}
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                    }}
                    label={t("manualLogin.code")}
                    placeholder={t("manualLogin.code")}
                    mb="xs"
                />
                <Flex justify="space-between">
                    <Button
                        disabled={value.trim() === "" || isLoading}
                        color="teal"
                        loading={isLoading}
                        onClick={() => {
                            setIsLoading(true);
                            authorize(value)
                                .then(() => {
                                    navigate("/");
                                })
                                .catch((err) => {
                                    console.error(err);
                                })
                                .finally(() => {
                                    setIsLoading(false);
                                });
                        }}
                    >
                        {t("manualLogin.loginButton")}
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => {
                            navigate("/login");
                        }}
                    >
                        {t("manualLogin.back")}
                    </Button>
                </Flex>
            </Paper>
        </Center>
    );
}
