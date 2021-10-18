export function parameterizeRow(row: any): any {
  const parameterizedRows = {};

  for (const key in row) {
    parameterizedRows['$' + key] = row[key];
  }

  return parameterizedRows;
}

export const globalOptions = {
  reactiveData: true,
  tooltips: true,
  addRowPos: 'top',
  pagination: 'local',
  paginationSize: 10,
  paginationButtonCount: 3,
  placeholder: 'Trenutno nema podataka!',
  layout: 'fitColumns',
  locale: true,
  groupToggleElement: 'header',
  // TODO change language from en-gb to hr-hr
  langs: {
    'en-gb': {
      pagination: {
        first: 'Prva',
        first_title: 'Prva stranica',
        last: 'Poslijednja',
        last_title: 'Poslijednja stranica',
        prev: '<-',
        prev_title: 'Prethodna stranica',
        next: '->',
        next_title: 'Slijedeća stranica',
        all: 'All',
      },
    },
  },
};
