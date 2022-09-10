/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { ReactTabulator } from 'react-tabulator';
import { Table } from '../tables/tableConfigInterface';

export interface SearchProps {
  columns: Table['inputs'];
  table: ReactTabulator;
}

export interface SearchState {
  searchValue: string;
  columns: { field: string; filter: boolean }[] | null;
}

class Search extends React.Component<SearchProps, SearchState> {
  constructor(props: SearchProps) {
    super(props);
    this.state = {
      searchValue: '',
      columns: null,
    };
  }

  componentDidUpdate() {
    const { table } = this.props;
    const { columns } = this.state;
    if (!columns) {
      this.setColumns(table.getColumnDefinitions());
    }
  }

  setColumns = (tabulatorColumns: any) => {
    let { columns } = this.state;
    columns = [];

    for (const column of tabulatorColumns) {
      if (column['field']) {
        // TODO ovo je smetje
        // TODO actions crasha searcha zoto je filtrerani vum
        if (column['field'] !== 'actions') {
          columns.push({ field: column['field'], filter: true });
        }
      }
    }

    this.setState({ columns });
  };

  filterData = (data: any, searchValue: string): boolean => {
    const { columns } = this.state;

    if (columns) {
      for (const column of columns) {
        if (column.filter) {
          if (
            data[column.field].toString().toLowerCase().includes(searchValue)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  customFilter = (data: any, filterParams: any): boolean => {
    const { searchValue } = this.state;
    const trimmedSearch = searchValue.trim().toLocaleLowerCase();

    if (trimmedSearch === '') {
      return true;
    }

    return this.filterData(data, trimmedSearch);
    // return (
    //   data.id.toString().toLowerCase().includes(searchValue) ||
    //   data.naziv.toString().toLowerCase().includes(searchValue)
    // );
  };

  updateSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { searchValue } = this.state;
    const { table } = this.props;
    searchValue = String(e.target.value);
    this.setState({ searchValue }, () => {
      if (table) {
        table.removeFilter(this.customFilter);
        table.addFilter(this.customFilter);
      }
    });
  };

  render() {
    const { searchValue } = this.state;
    return (
      <Form.Group className="w-100">
        <Form.Label>Pretraživanje</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <i className="fas fa-search" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Pretraživanje"
            value={searchValue}
            onChange={this.updateSearchValue}
          />
        </InputGroup>
      </Form.Group>
    );
  }
}

export default Search;
