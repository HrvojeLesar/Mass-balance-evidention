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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCog } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

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
            link: "/options",
            label: "Options",
            type: NavigationLinkType.IconLink,
        },
    ];

    const [active, setActive] = useState(location.pathname);

    const generateLabelLink = (link: NavigationLink) => {
        return (
            <a
                key={link.label}
                href={link.link}
                className={cx(classes.link, {
                    [classes.linkActive]: active === link.link
                })}
                onClick={(event) => {
                    event.preventDefault();
                    setActive(link.link);
                    close();
                    navigate(link.link);
                }}
            >
                {link.label}
            </a>
        );
    };

    const generateIconLink = (link: NavigationLink) => {
        return (
            <ActionIcon
                key={link.label}
                color={active === link.link ? "blue" : "gray"}
                variant="outline"
                onClick={(event) => {
                    event.preventDefault();
                    setActive(link.link);
                    close();
                    navigate(link.link);
                }}
            >
                <FaCog />
            </ActionIcon>
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
                            <Text
                                size="xl"
                                fw={700}
                                onClick={() => {
                                    navigate("/");
                                }}
                                className={classes.mbeHome}
                            >
                                Mass Balance Evidention
                            </Text>
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
