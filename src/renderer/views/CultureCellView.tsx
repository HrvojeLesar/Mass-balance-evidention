/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Table from '../components/TableComp';
import CellCultures from '../tables/cell_cultures_buyers/cellCultures';
import Cells from '../tables/cell_cultures_buyers/cells';
import Cultures from '../tables/cell_cultures_buyers/cultures';
import Buyers from '../tables/cell_cultures_buyers/buyers';
import {
  loadData,
  handleSave,
  handleDelete,
  TableConfigData,
  handleUpdate,
} from './utils';
import { CurrentDatabaseContext } from '../context/CurrentDatabaseProvider';

export interface CultureCellViewProps {}

export interface CultureCellViewState {
  cells: TableConfigData;
  cultures: TableConfigData;
  cellCultures: TableConfigData;
  buyers: TableConfigData;
}

class CultureCellView extends React.Component<
  CultureCellViewProps,
  CultureCellViewState
> {
  isStateUpdateAllowed: boolean;

  constructor(props: CultureCellViewProps) {
    super(props);
    this.isStateUpdateAllowed = true;
    this.state = {
      cells: { tableConfig: new Cells(), data: [] },
      cultures: { tableConfig: new Cultures(), data: [] },
      cellCultures: { tableConfig: new CellCultures(), data: [] },
      buyers: { tableConfig: new Buyers(), data: [] },
    };
  }

  componentDidMount() {
    const { cells, cultures, cellCultures, buyers } = this.state;
    loadData(cells, Cells.load, () => this.updateData(this.updateCells));
    loadData(cultures, Cultures.load, () =>
      this.updateData(this.updateCultures)
    );
    loadData(cellCultures, CellCultures.load, () =>
      this.updateData(this.updateCellCultures)
    );
    loadData(buyers, Buyers.load, () => this.updateData(this.updateBuyers));
  }

  componentDidUpdate() {
    const { currentDb } = this.context;
    document.title = `Unos čestica, kultura, kupaca | Trenutna baza : [${currentDb.alias}]`;
  }

  componentWillUnmount() {
    this.isStateUpdateAllowed = false;
  }

  updateCells = (data: any = undefined) => {
    const { cells } = this.state;
    if (data) {
      cells.data = data;
    }
    this.setState({ cells });
  };

  updateCultures = (data: any = undefined) => {
    const { cultures } = this.state;
    if (data) {
      cultures.data = data;
    }
    this.setState({ cultures });
  };

  updateCellCultures = (data: any = undefined) => {
    const { cellCultures } = this.state;
    if (data) {
      cellCultures.data = data;
    }
    this.setState({ cellCultures });
  };

  updateBuyers = (data: any = undefined) => {
    const { buyers } = this.state;
    if (data) {
      buyers.data = data;
    }
    this.setState({ buyers });
  };

  updateData = (
    setStateFunc: (args: any) => void,
    funcArgs: any = undefined
  ) => {
    if (this.isStateUpdateAllowed) {
      setStateFunc(funcArgs);
    }
  };

  render() {
    const { cells, cultures, cellCultures, buyers } = this.state;
    return (
      <Container>
        <Row>
          <Col>
            <Table
              title="Unos para čestica i kultura"
              tableConfig={cellCultures.tableConfig}
              data={cellCultures.data}
              hasFilter
              updateData={(data: any) => {
                this.updateData(this.updateCellCultures, data);
              }}
              insert={(row: any) => {
                return handleSave(row, CellCultures.save, cellCultures, () => {
                  this.updateData(this.updateCellCultures);
                });
              }}
              update={(newValues: any, oldRow: any) => {
                return handleUpdate(
                  newValues,
                  oldRow,
                  CellCultures.updateDbRow,
                  CellCultures.updateRow,
                  () => {
                    this.updateData(this.updateCellCultures);
                  }
                );
              }}
              del={(rowIndex: any) => {
                return handleDelete(
                  rowIndex,
                  CellCultures.delete,
                  cellCultures,
                  () => {
                    this.updateData(this.updateCellCultures);
                  }
                );
              }}
              additionalTableData={{
                cestica: {
                  data: cells.data,
                  save: (row: any) => {
                    return handleSave(row, Cells.save, cells, () => {
                      this.updateData(this.updateCells);
                    });
                  },
                },
                kultura: {
                  data: cultures.data,
                  save: (row: any) => {
                    return handleSave(row, Cultures.save, cultures, () => {
                      this.updateData(this.updateCultures);
                    });
                  },
                },
              }}
              customRowFormatter={CellCultures.customRow}
            />
          </Col>
        </Row>
        <Row>
          <Col className="col-6">
            <Table
              title="Unos čestica"
              tableConfig={cells.tableConfig}
              data={cells.data}
              updateData={(data: any) => {
                this.updateData(this.updateCells, data);
              }}
              del={(rowIndex: number) => {
                return handleDelete(rowIndex, Cells.delete, cells, () => {
                  this.updateData(this.updateCells);
                });
              }}
              insert={(row: any) => {
                return handleSave(row, Cells.save, cells, this.updateCells);
              }}
              update={(newValues: any, oldRow: any) => {
                return handleUpdate(
                  newValues,
                  oldRow,
                  Cells.updateDbRow,
                  Cells.updateRow,
                  () => {
                    this.updateData(this.updateCells);
                  }
                );
              }}
            />
          </Col>
          <Col className="col-6">
            <Table
              title="Unos kultura"
              tableConfig={cultures.tableConfig}
              data={cultures.data}
              updateData={(data: any) => {
                this.updateData(this.updateCultures, data);
              }}
              del={(rowIndex: number) => {
                return handleDelete(rowIndex, Cultures.delete, cultures, () => {
                  this.updateData(this.updateCultures);
                });
              }}
              insert={(row: any) => {
                return handleSave(row, Cultures.save, cultures, () => {
                  this.updateData(this.updateCultures);
                });
              }}
              update={(newValues: any, oldRow: any) => {
                return handleUpdate(
                  newValues,
                  oldRow,
                  Cultures.updateDbRow,
                  Cultures.updateRow,
                  () => {
                    this.updateData(this.updateCultures);
                  }
                );
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              title="Unos kupca"
              tableConfig={buyers.tableConfig}
              data={buyers.data}
              updateData={(data: any) => {
                this.updateData(this.updateBuyers, data);
              }}
              del={(rowIndex: number) => {
                return handleDelete(rowIndex, Buyers.delete, buyers, () => {
                  this.updateData(this.updateBuyers);
                });
              }}
              insert={(row: any) => {
                return handleSave(row, Buyers.save, buyers, this.updateBuyers);
              }}
              update={(newValues: any, oldRow: any) => {
                return handleUpdate(
                  newValues,
                  oldRow,
                  Buyers.updateDbRow,
                  Buyers.updateRow,
                  () => {
                    this.updateData(this.updateBuyers);
                  }
                );
              }}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

CultureCellView.contextType = CurrentDatabaseContext;

export default CultureCellView;
