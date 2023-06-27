import { Button, Center, Divider, Flex, Textarea, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CardUtil from "./util/CardUtil";

const authorize = async (code: string): Promise<AxiosResponse<any, any>> => {
    return axios.post(import.meta.env.VITE_MANUAL_AUTH, {
        code,
    }, {
        withCredentials: true,
    });
};

export default function LoginCodeInsert() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Center>
            <CardUtil>
                <Title order={4}>Other login</Title>
                <Divider my="xs" />
                <Textarea
                    required
                    value={value}
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                    }}
                    label="labela"
                    placeholder="placeholder"
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
                        Login
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => {
                            navigate("/login");
                        }}
                    >
                        Back
                    </Button>
                </Flex>
            </CardUtil>
        </Center>
    );
}
