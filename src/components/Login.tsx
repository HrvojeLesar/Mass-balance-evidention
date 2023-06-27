import { Button, Center, Divider, Flex, Title } from "@mantine/core";
import { useContext, useEffect } from "react";
import { FaFacebook, FaGithub, FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";
import CardUtil from "./util/CardUtil";
import createLink from "./util/platformLinks";
import { open } from "@tauri-apps/api/shell";

const manual_login_handler = async (
    url: string,
    navigate: NavigateFunction
) => {
    await open(createLink(url));
    navigate("/manual-login");
};

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (authContext.authorized) {
            navigate(location.state?.from?.pathname ?? "/", { replace: true });
        }
    }, [authContext.authorized, navigate]);

    return (
        <Center>
            <CardUtil>
                <Title order={4}>Login</Title>
                <Divider my="xs" />
                <Flex direction="column" gap="sm">
                    {import.meta.env.TAURI_PLATFORM ? (
                        <>
                            <Button
                                onClick={() => {
                                    manual_login_handler(
                                        import.meta.env.VITE_LOGIN_GOOGLE,
                                        navigate
                                    );
                                }}
                                leftIcon={<FcGoogle />}
                                variant="default"
                                color="gray"
                            >
                                Login with Google
                            </Button>
                            <Button
                                onClick={() => {
                                    manual_login_handler(
                                        import.meta.env.VITE_LOGIN_MICROSOFT,
                                        navigate);
                                }}
                                leftIcon={<FaMicrosoft />}
                                variant="default"
                                color="gray"
                            >
                                Login with Microsoft Account
                            </Button>
                            <Button
                                onClick={() => {
                                    manual_login_handler(
                                        import.meta.env.VITE_LOGIN_GITHUB,
                                        navigate);
                                }}
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
                                            theme.colorScheme === "dark"
                                                ? 8
                                                : 5
                                            ],
                                    },
                                })}
                            >
                                Login with Github
                            </Button>
                            <Button
                                onClick={() => {
                                    manual_login_handler(
                                        import.meta.env.VITE_LOGIN_FACEBOOK,
                                        navigate);
                                }}
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
                        </>
                    ) : (
                        <>
                            <Button
                                component="a"
                                href={createLink(
                                    import.meta.env.VITE_LOGIN_GOOGLE
                                )}
                                leftIcon={<FcGoogle />}
                                variant="default"
                                color="gray"
                            >
                                Login with Google
                            </Button>
                            <Button
                                component="a"
                                href={createLink(
                                    import.meta.env.VITE_LOGIN_MICROSOFT
                                )}
                                leftIcon={<FaMicrosoft />}
                                variant="default"
                                color="gray"
                            >
                                Login with Microsoft Account
                            </Button>
                            <Button
                                component="a"
                                href={createLink(
                                    import.meta.env.VITE_LOGIN_GITHUB
                                )}
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
                                            theme.colorScheme === "dark"
                                                ? 8
                                                : 5
                                            ],
                                    },
                                })}
                            >
                                Login with Github
                            </Button>
                            <Button
                                component="a"
                                href={createLink(
                                    import.meta.env.VITE_LOGIN_FACEBOOK
                                )}
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
                        </>
                    )}
                </Flex>
            </CardUtil>
        </Center>
    );
}
