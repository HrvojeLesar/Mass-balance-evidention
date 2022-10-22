import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaCog } from "react-icons/fa";
import { Link, useMatch } from "react-router-dom";

type BaseNavLinkProps = {
    linkDesc: ReactNode;
    to: string;
};

function BaseNavLink({ linkDesc, to }: BaseNavLinkProps) {
    const match = useMatch(to);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (match !== null) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [match]);

    const activeClass = useMemo(() => {
        return isActive ? "active nav-link" : "nav-link";
    }, [isActive]);

    return (
        <Link to={to} className={activeClass}>
            {linkDesc}
        </Link>
    );
}

type AppNavbarProps = {
    children?: ReactNode;
};

export default function AppNavbar({ children }: AppNavbarProps) {
    const { t } = useTranslation();
    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Link to="/" className="navbar-brand">
                        Mass Balance Evidention
                    </Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <BaseNavLink
                                linkDesc={t("navigation.root").toString()}
                                to="/"
                            />
                            <BaseNavLink
                                linkDesc={t(
                                    "navigation.insertEntry"
                                ).toString()}
                                to="/insert-entry"
                            />
                            <BaseNavLink
                                linkDesc={t(
                                    "navigation.insertOther"
                                ).toString()}
                                to="/insert-cell-culture-buyer"
                            />
                        </Nav>
                        <Nav>
                            <BaseNavLink
                                linkDesc={<FaCog size={24} />}
                                to="/options"
                            />
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <React.Fragment>
                <Container className="my-4">{children}</Container>
            </React.Fragment>
        </>
    );
}
