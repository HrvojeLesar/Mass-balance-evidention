import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Table from '../components/TableComp';
import {
  loadData,
  handleSave,
  handleDelete,
  TableConfigData,
  handleUpdate,
} from './utils';
import EntryInsertTable from '../tables/entry/entryInsertTable';
import Buyers from '../tables/cell_cultures_buyers/buyers';
import { CurrentDatabaseContext } from '../context/CurrentDatabaseProvider';

export interface EntryInsertViewProps {}

export interface EntryInsertViewState {
  entry: TableConfigData;
  cells: any;
  cultures: any;
  buyers: any;
}

class EntryInsertView extends React.Component<
  EntryInsertViewProps,
  EntryInsertViewState
> {
  isStateUpdateAllowed: boolean;

  constructor(props: EntryInsertViewProps) {
    super(props);
    this.isStateUpdateAllowed = true;
    this.state = {
      entry: { tableConfig: new EntryInsertTable(), data: [] },
      buyers: { data: [] },
      cells: { data: [] },
      cultures: { data: [] },
    };
  }

  componentDidMount() {
    const { entry, buyers } = this.state;
    loadData(entry, EntryInsertTable.load, () =>
      this.updateData(this.updateEntry)
    );
    this.loadCells();
    this.loadCultures();
    loadData(buyers, Buyers.load, () => this.updateData(this.updateBuyers));
  }

  componentDidUpdate() {
    const { currentDb } = this.context;
    document.title = `Unos zapisa | Trenutna baza : [${currentDb.alias}]`;
  }

  componentWillUnmount() {
    this.isStateUpdateAllowed = false;
  }

  updateEntry = (data: any) => {
    const { entry } = this.state;
    if (data) {
      entry.data = data;
    }
    this.setState({ entry });
  };

  updateBuyers = () => {
    const { buyers } = this.state;
    this.setState({ buyers });
  };

  updateCells = () => {
    const { cells } = this.state;
    this.setState({ cells });
  };

  updateCultures = () => {
    const { cultures } = this.state;
    this.setState({ cultures });
  };

  loadCells = () => {
    const { cells } = this.state;
    loadData(cells, EntryInsertTable.loadCells, () =>
      this.updateData(this.updateCells)
    );
  };

  loadCultures = () => {
    const { cultures } = this.state;
    loadData(cultures, EntryInsertTable.loadCultures, () =>
      this.updateData(this.updateCultures)
    );
  };

  setBoundCells = (rowId: number) => {
    const { cells } = this.state;
    loadData(
      cells,
      EntryInsertTable.loadSelectedCulture_Cells,
      () => this.updateData(this.updateCells),
      rowId
    );
  };

  setBoundCultures = (rowId: number) => {
    const { cultures } = this.state;
    loadData(
      cultures,
      EntryInsertTable.loadSelectedCells_Culture,
      () => this.updateData(this.updateCultures),
      rowId
    );
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
    const { entry, cells, cultures, buyers } = this.state;
    // const updateEntry = () => this.setState({ entry });
    return (
      <Container>
        <Row>
          <Col>
            <Table
              title="Unos zapisa"
              tableConfig={entry.tableConfig}
              data={entry.data}
              updateData={(data: any) => {
                this.updateData(this.updateEntry, data);
              }}
              insert={(row: any) => {
                return handleSave(row, EntryInsertTable.save, entry, () => {
                  this.updateData(this.updateEntry);
                });
              }}
              del={(rowIndex: any) => {
                return handleDelete(
                  rowIndex,
                  EntryInsertTable.delete,
                  entry,
                  () => {
                    this.updateData(this.updateEntry);
                  }
                );
              }}
              update={(newValues: any, oldRow: any) => {
                return handleUpdate(
                  newValues,
                  oldRow,
                  EntryInsertTable.updateDbRow,
                  EntryInsertTable.updateRow,
                  () => {
                    this.updateData(this.updateEntry);
                  }
                );
              }}
              additionalTableData={{
                cestica: {
                  data: cells.data,
                  setBound: this.setBoundCultures,
                  resetData: this.loadCultures,
                },
                kultura: {
                  data: cultures.data,
                  setBound: this.setBoundCells,
                  resetData: this.loadCells,
                },
                kupac: {
                  data: buyers.data,
                },
              }}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

EntryInsertView.contextType = CurrentDatabaseContext;

export default EntryInsertView;
