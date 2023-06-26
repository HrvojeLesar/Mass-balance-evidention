import { createStyles, Title, Button, Container, Group } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";

const useStyles = createStyles((theme) => ({
    root: {
        paddingTop: 80,
        paddingBottom: 80,
    },

    label: {
        textAlign: "center",
        fontWeight: 900,
        fontSize: 220,
        lineHeight: 1,
        marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[4]
                : theme.colors.gray[2],

        [theme.fn.smallerThan("sm")]: {
            fontSize: 120,
        },
    },

    title: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        textAlign: "center",
        fontWeight: 900,
        fontSize: 38,

        [theme.fn.smallerThan("sm")]: {
            fontSize: 32,
        },
    },

    description: {
        maxWidth: 500,
        margin: "auto",
        marginTop: theme.spacing.xl,
        marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    },
    background: {
        backgroundColor:
            theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
        height: "100vh",
        width: "100vw",
    },
}));

export default function NotFound() {
    const { classes } = useStyles();
    const navigate = useNavigate();

    useDocumentTitle("Not found");

    return (
        <div className={classes.background}>
            <Container className={classes.root}>
                <div className={classes.label}>404</div>
                <Title className={classes.title}>Page not found</Title>
                <Group mt="xl" position="center">
                    <Button onClick={() => {
                        navigate("/");
                    }} variant="subtle" size="md">
                        Take me back to home page
                    </Button>
                </Group>
            </Container>
        </div>
    );
}
