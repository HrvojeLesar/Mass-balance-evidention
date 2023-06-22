import {
    AppShell,
    Burger,
    Header,
    Text,
    Group,
    Transition,
    Paper,
    createStyles,
    Container,
    ActionIcon,
    MediaQuery,
    Flex,
    Menu,
    Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useCallback, useMemo } from "react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FaCog } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as MBELogo } from "./assets/mbe.svg";

type AppNavbarProps = {
    children?: ReactNode;
};

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
    dropdown: {
        position: "absolute",
        top: HEADER_HEIGHT,
        left: 0,
        right: 0,
        zIndex: 999,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderTopWidth: 0,
        overflow: "hidden",

        [theme.fn.largerThan("sm")]: {
            display: "none",
        },
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
    },

    links: {
        [theme.fn.smallerThan("sm")]: {
            display: "none",
        },
    },

    burger: {
        [theme.fn.largerThan("sm")]: {
            display: "none",
        },
    },

    link: {
        display: "block",
        lineHeight: 1,
        padding: "8px 12px",
        borderRadius: theme.radius.sm,
        textDecoration: "none",
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
        },

        [theme.fn.smallerThan("sm")]: {
            borderRadius: 0,
            padding: theme.spacing.md,
        },
    },

    linkActive: {
        "&, &:hover": {
            backgroundColor: theme.fn.variant({
                variant: "light",
                color: theme.primaryColor,
            }).background,
            color: theme.fn.variant({
                variant: "light",
                color: theme.primaryColor,
            }).color,
        },
    },

    mbeHome: {
        cursor: "pointer",
    },

    logo: {
        marginRight: "2px",
    },
}));

enum NavigationLinkType {
    LabelLink,
    IconLink,
    Multi,
}

type NavigationLink = {
    link: string;
    label: string;
    icon?: JSX.Element;
    type: NavigationLinkType.LabelLink | NavigationLinkType.IconLink;
    hasSubRoutes?: boolean;
};

type MultiNavigationButton = {
    key: string;
    links: NavigationLink[];
    type: NavigationLinkType.Multi;
};

export default function AppNavbar({ children }: AppNavbarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [opened, { toggle, close }] = useDisclosure(false);
    const { classes, cx } = useStyles();

    const links: (NavigationLink | MultiNavigationButton)[] = useMemo(() => {
        return [
            {
                link: "/",
                label: t("navigation.root").toString(),
                type: NavigationLinkType.LabelLink,
            },
            {
                link: "/insert-entry",
                label: t("navigation.insertEntry").toString(),
                type: NavigationLinkType.LabelLink,
            },
            {
                link: "/insert-cell-culture-buyer",
                label: t("navigation.insertOther").toString(),
                type: NavigationLinkType.LabelLink,
            },
            {
                link: "/article",
                label: t("navigation.articleMeasureTypes").toString(),
                type: NavigationLinkType.LabelLink,
            },
            {
                link: "/dispatch-note",
                label: t("navigation.dispatchNote").toString(),
                type: NavigationLinkType.LabelLink,
                hasSubRoutes: true,
            },
            {
                key: "/options",
                links: [
                    {
                        link: "/options-data-groups",
                        label: t("navigation.dataGroupOptions").toString(),
                        icon: <FaCog />,
                        type: NavigationLinkType.IconLink,
                    },
                    {
                        link: "/options-mbe-groups",
                        label: t("navigation.groupOptions").toString(),
                        icon: <FaCog />,
                        type: NavigationLinkType.IconLink,
                    },
                    {
                        link: "/logout",
                        label: t("navigation.logout").toString(),
                        type: NavigationLinkType.IconLink,
                    },
                ],
                type: NavigationLinkType.Multi,
            },
        ];
    }, [t]);

    const active = location.pathname;

    const isActive = useCallback(
        (link: NavigationLink) => {
            return link.hasSubRoutes
                ? active.includes(link.link)
                : active === link.link;
        },
        [active]
    );

    const handleOnClick = useCallback(
        (event: React.MouseEvent, link: string) => {
            event.preventDefault();
            close();
            navigate(link);
        },
        [close, navigate]
    );

    const generateLabelLink = useCallback(
        (link: NavigationLink) => {
            return (
                <a
                    key={link.label}
                    href={link.link}
                    title={link.label}
                    className={cx(classes.link, {
                        [classes.linkActive]: isActive(link),
                    })}
                    onClick={(event) => {
                        handleOnClick(event, link.link);
                    }}
                >
                    {link.label}
                </a>
            );
        },
        [isActive, classes.linkActive, classes.link, cx, handleOnClick]
    );

    const generateIconLink = useCallback(
        (link: NavigationLink) => {
            return (
                <React.Fragment key={link.label}>
                    <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                        <ActionIcon
                            title={link.label}
                            color={isActive(link) ? "blue" : "gray"}
                            variant="outline"
                            onClick={(event) => {
                                handleOnClick(event, link.link);
                            }}
                        >
                            <FaCog />
                        </ActionIcon>
                    </MediaQuery>
                    <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                        <a
                            href={link.link}
                            title={link.label}
                            className={cx(classes.link, {
                                [classes.linkActive]: isActive(link),
                            })}
                            onClick={(event) => {
                                handleOnClick(event, link.link);
                            }}
                        >
                            <Flex gap="sm" align="center">
                                <FaCog />
                                <Text>{link.label}</Text>
                            </Flex>
                        </a>
                    </MediaQuery>
                </React.Fragment>
            );
        },
        [isActive, classes.linkActive, classes.link, cx, handleOnClick]
    );

    const generateMultiNavigationButton = useCallback(
        (multi: MultiNavigationButton) => {
            const isAnyMultiActive = () => {
                return multi.links.find(
                    (navigationLink) => active === navigationLink.link
                ) !== undefined
                    ? true
                    : false;
            };
            return (
                <React.Fragment key={multi.key}>
                    <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <ActionIcon
                                    title={t("navigation.options").toString()}
                                    color={isAnyMultiActive() ? "blue" : "gray"}
                                    variant="outline"
                                >
                                    <FaCog />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                {multi.links.map((navigationLink) => {
                                    return (
                                        <Menu.Item
                                            key={navigationLink.link}
                                            className={cx(classes.link, {
                                                [classes.linkActive]:
                                                    active ===
                                                    navigationLink.link,
                                            })}
                                            onClick={(e) => {
                                                handleOnClick(
                                                    e,
                                                    navigationLink.link
                                                );
                                            }}
                                        >
                                            {navigationLink.label}
                                        </Menu.Item>
                                    );
                                })}
                            </Menu.Dropdown>
                        </Menu>
                    </MediaQuery>
                    <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                        <div>
                            <Divider
                                label={t("navigation.options")}
                                labelPosition="center"
                            />
                            {multi.links.map((navigationLink) => {
                                return (
                                    <a
                                        key={navigationLink.link}
                                        href={navigationLink.link}
                                        title={navigationLink.label}
                                        className={cx(classes.link, {
                                            [classes.linkActive]:
                                                active === navigationLink.link,
                                        })}
                                        onClick={(event) => {
                                            handleOnClick(
                                                event,
                                                navigationLink.link
                                            );
                                        }}
                                    >
                                        <Flex gap="sm" align="center">
                                            {navigationLink.icon ?? <></>}
                                            <Text>{navigationLink.label}</Text>
                                        </Flex>
                                    </a>
                                );
                            })}
                        </div>
                    </MediaQuery>
                </React.Fragment>
            );
        },
        [active, classes.link, classes.linkActive, cx, handleOnClick, t]
    );

    const navbarItems = useMemo(() => {
        return links.map((link) => {
            switch (link.type) {
                case NavigationLinkType.LabelLink:
                    return generateLabelLink(link);
                case NavigationLinkType.IconLink:
                    return generateIconLink(link);
                case NavigationLinkType.Multi:
                    return generateMultiNavigationButton(link);
                default:
                    return <></>;
            }
        });
    }, [
        links,
        generateLabelLink,
        generateIconLink,
        generateMultiNavigationButton,
    ]);

    return (
        <>
            <AppShell
                fixed={false}
                header={
                    <Header height={HEADER_HEIGHT}>
                        <Container size="xl" className={classes.header}>
                            <Flex
                                align="center"
                                className={classes.mbeHome}
                                onClick={(event) => {
                                    handleOnClick(event, "/");
                                }}
                            >
                                <MBELogo
                                    width="1.5em"
                                    height="1.5em"
                                    className={classes.logo}
                                />
                                <Text size="xl" fw={700}>
                                    Mass Balance Evidention
                                </Text>
                            </Flex>
                            <Group spacing={5} className={classes.links}>
                                {navbarItems}
                            </Group>

                            <Burger
                                opened={opened}
                                onClick={toggle}
                                className={classes.burger}
                                size="sm"
                            />

                            <Transition
                                transition="pop-top-right"
                                duration={200}
                                mounted={opened}
                            >
                                {(styles) => (
                                    <Paper
                                        className={classes.dropdown}
                                        withBorder
                                        style={styles}
                                    >
                                        {navbarItems}
                                    </Paper>
                                )}
                            </Transition>
                        </Container>
                    </Header>
                }
            >
                <Container size="xl">{children}</Container>
            </AppShell>
        </>
    );
}
