import React from 'react';
import CultureCellView from '../views/CultureCellView';
import EntryInsertView from '../views/EntryInsertView';
import SettingsView from '../views/SettingsView';
import EntryView from '../views/EntryView';

export const routes = [
  {
    path: '/',
    component: EntryView,
    name: 'Pregled zapisa',
  },
  {
    path: '/entry-insert',
    component: EntryInsertView,
    name: 'Unos zapisa',
  },
  {
    path: '/culture-cell-view',
    component: CultureCellView,
    name: 'Unos čestica, kultura, kupaca',
  },
];

export const options = {
  path: '/options',
  component: SettingsView,
  name: <i className="fas fa-cog fa-lg" />,
};
