import React, { Component } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { routes, options } from './Routes';

export interface NavigationProps {}

export interface NavigationState {}

class Navigation extends React.Component<NavigationProps, NavigationState> {
  constructor(props: NavigationProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Navbar variant="light" bg="light" expand="lg" className="shadow">
        <Container>
          <Navbar.Toggle className="mb-4" />
          <Navbar.Collapse>
            <Nav
              variant="tabs"
              defaultActiveKey={routes[0].path}
              className="w-100"
            >
              {routes.map((route) => {
                return (
                  <Nav.Item key={route.path}>
                    <Nav.Link as={NavLink} to={route.path} exact>
                      {route.name}
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link as={NavLink} to={options.path} exact>
                  {options.name}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default Navigation;
