import React from 'react';
import { render } from 'react-dom';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navigation from './components/Navigation';
import { routes, options } from './components/Routes';
import CurrentDatabaseProvider from './context/CurrentDatabaseProvider';
import './App.global.scss';

const moment = require('moment');

window.moment = moment;

declare global {
  interface Window {
    electron: any;
    api: any;
  }

  interface Inputs {
    title: string;
    bindTo: string;
    value: string;
    isInvalid: boolean;
  }
}

render(
  <Router>
    <CurrentDatabaseProvider>
      <Navigation />
      <Toaster />
      <Switch>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            component={route.component}
            exact
          />
        ))}
        ;
        <Route path={options.path} component={options.component} exact />
        <Route render={() => <Redirect to="/" />} />
      </Switch>
    </CurrentDatabaseProvider>
  </Router>,
  document.getElementById('root')
);
