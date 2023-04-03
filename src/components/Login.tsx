import { Button, Center, Divider, Flex, Title } from "@mantine/core";
import { useContext, useEffect } from "react";
import { FaFacebook, FaGithub, FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";
import CardUtil from "./util/CardUtil";

export default function Login() {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (authContext.authorized) {
            navigate("/", { replace: true });
        }
    }, [authContext.authorized, navigate]);

    return (
        <Center>
            <CardUtil>
                <Title order={4}>Login</Title>
                <Divider my="xs" />
                <Flex direction="column" gap="sm">
                    <Button
                        component="a"
                        href="http://localhost:8000/login-google"
                        leftIcon={<FcGoogle />}
                        variant="default"
                        color="gray"
                    >
                        Login with Google
                    </Button>
                    <Button
                        component="a"
                        href="http://localhost:8000/login-ms"
                        leftIcon={<FaMicrosoft />}
                        variant="default"
                        color="gray"
                    >
                        Login with Microsoft Account
                    </Button>
                    <Button
                        component="a"
                        href="http://localhost:8000/login-gh"
                        leftIcon={<FaGithub />}
                        sx={(theme) => ({
                            backgroundColor:
                                theme.colors.dark[
                                    theme.colorScheme === "dark" ? 9 : 6
                                ],
                            color: "#fff",
                            "&:hover": {
                                backgroundColor:
                                    theme.colors.dark[
                                        theme.colorScheme === "dark" ? 8 : 5
                                    ],
                            },
                        })}
                    >
                        Login with Github
                    </Button>
                    <Button
                        component="a"
                        href="http://localhost:8000/login-fb"
                        leftIcon={<FaFacebook />}
                        sx={(theme) => ({
                            backgroundColor: "#4267B2",
                            color: "#fff",
                            "&:not([data-disabled]):hover": {
                                backgroundColor: theme.fn.darken(
                                    "#4267B2",
                                    0.1
                                ),
                            },
                        })}
                    >
                        Login with Facebook
                    </Button>
                </Flex>
            </CardUtil>
        </Center>
    );
}
