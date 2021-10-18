import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { loadData, TableConfigData } from './utils';
import Table from '../components/TableComp';
import EntryListTable from '../tables/entry/entryListTable';
import { CurrentDatabaseContext } from '../context/CurrentDatabaseProvider';

export interface EntryViewProps {}

export interface EntryViewState {
  entry: TableConfigData;
}

class EntryView extends React.Component<EntryViewProps, EntryViewState> {
  isStateUpdateAllowed: boolean;

  constructor(props: EntryViewProps) {
    super(props);
    this.isStateUpdateAllowed = true;
    this.state = { entry: { tableConfig: new EntryListTable(), data: [] } };
  }

  componentDidMount() {
    const { entry } = this.state;
    loadData(entry, EntryListTable.load, () =>
      this.updateData(this.updateEntry)
    );
  }

  componentDidUpdate() {
    const { currentDb } = this.context;
    document.title = `Pregled zapisa | Trenutna baza : [${currentDb.alias}]`;
  }

  updateEntry = () => {
    const { entry } = this.state;
    this.setState({ entry });
  };

  updateData = (setStateFunc: () => void) => {
    if (this.isStateUpdateAllowed) {
      setStateFunc();
    }
  };

  render() {
    const { entry } = this.state;
    return (
      <Container>
        <Row>
          <Col>
            <Table
              title="Pregled zapisa"
              tableConfig={entry.tableConfig}
              data={entry.data}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

EntryView.contextType = CurrentDatabaseContext;

export default EntryView;
