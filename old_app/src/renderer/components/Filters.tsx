import * as React from 'react';
import { Col, Dropdown, Button, Row, Container } from 'react-bootstrap';
import Filter from './Filter';

export interface FiltersProps {
  table: any;
  fields: any;
}

export interface FiltersState {
  filters: number[];
  uniqueIdentifier: number;
}

class Filters extends React.Component<FiltersProps, FiltersState> {
  constructor(props: FiltersProps) {
    super(props);
    this.state = {
      filters: [],
      uniqueIdentifier: 0,
    };
  }

  componentDidMount() {
    this.addFilter();
  }

  componentDidUpdate() {
    const { filters } = this.state;
    if (filters.length === 0) {
      this.addFilter();
    }
  }

  addFilter = () => {
    const { filters } = this.state;
    let { uniqueIdentifier } = this.state;
    filters.push(uniqueIdentifier);
    uniqueIdentifier += 1;
    this.setState({ filters, uniqueIdentifier });
  };

  removeFilter = (index: number) => {
    const { filters } = this.state;
    filters.splice(index, 1);
    this.setState({ filters });
  };

  render() {
    const { filters } = this.state;
    const { table, fields } = this.props;
    return (
      <Dropdown>
        <Dropdown.Toggle>
          <i className="fas fa-filter" />
        </Dropdown.Toggle>
        <Dropdown.Menu
          style={{ maxHeight: `${35}vh` }}
          className="overflow-auto shadow p-0"
        >
          <Dropdown.Header className="sticky-top dropdown-header bg-white pb-0">
            <Row>
              <Col>
                <Button onClick={this.addFilter}>Dodaj filter</Button>
                <div className="dropdown-divider" />
              </Col>
            </Row>
          </Dropdown.Header>
          <Container className="pb-2">
            {filters.map((uid, index) => {
              return (
                <Row className="my-1" key={uid}>
                  <Filter
                    table={table}
                    fields={fields}
                    removeFilter={() => {
                      this.removeFilter(index);
                    }}
                  />
                </Row>
              );
            })}
          </Container>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default Filters;
