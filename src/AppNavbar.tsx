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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
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
}

type NavigationLink = {
    link: string;
    label: string;
    type?: NavigationLinkType;
};

export default function AppNavbar({ children }: AppNavbarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [opened, { toggle, close }] = useDisclosure(false);
    const { classes, cx } = useStyles();

    const links: NavigationLink[] = [
        { link: "/", label: t("navigation.root").toString() },
        {
            link: "/insert-entry",
            label: t("navigation.insertEntry").toString(),
        },
        {
            link: "/insert-cell-culture-buyer",
            label: t("navigation.insertOther").toString(),
        },
        {
            link: "/article",
            label: t("navigation.article").toString(),
        },
        {
            link: "/dispatch-note",
            label: t("navigation.dispatchNote").toString(),
        },
        {
            link: "/options",
            label: t("navigation.options").toString(),
            type: NavigationLinkType.IconLink,
        },
    ];

    const active = location.pathname;

    const handleOnClick = (event: React.MouseEvent, link: string) => {
        event.preventDefault();
        close();
        navigate(link);
    };

    const generateLabelLink = (link: NavigationLink) => {
        return (
            <a
                key={link.label}
                href={link.link}
                title={link.label}
                className={cx(classes.link, {
                    [classes.linkActive]: active === link.link,
                })}
                onClick={(event) => {
                    handleOnClick(event, link.link);
                }}
            >
                {link.label}
            </a>
        );
    };

    const generateIconLink = (link: NavigationLink) => {
        return (
            <React.Fragment key={link.label}>
                <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                    <ActionIcon
                        title={link.label}
                        color={active === link.link ? "blue" : "gray"}
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
                            [classes.linkActive]: active === link.link,
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
    };

    const items = links.map((link) => {
        switch (link.type) {
            case NavigationLinkType.LabelLink:
                return generateLabelLink(link);
            case NavigationLinkType.IconLink:
                return generateIconLink(link);
            default:
                return generateLabelLink(link);
        }
    });

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
                                {items}
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
                                        {items}
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
