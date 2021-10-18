import React from 'react';
import { Button, Row, Col, Container, Card, Form } from 'react-bootstrap';
import { ConfigJSON, DatabaseConfigInfo } from '../../main/utilities/config';
import { CurrentDatabaseContext } from '../context/CurrentDatabaseProvider';

export interface SettingsViewProps {}

export interface SettingsViewState {
  newDbName: string;
  isNameInvalid: {
    newDb: boolean;
    renameDb: boolean;
  };
  isFieldEmpty: {
    newDb: boolean;
    renameDb: boolean;
  };
  databases: DatabaseConfigInfo[];
  currentlySelectedDb: DatabaseConfigInfo;
  renameVal: string;
}

class SettingsView extends React.Component<
  SettingsViewProps,
  SettingsViewState
> {
  dbNameCheckReg: RegExp;

  constructor(props: SettingsViewProps) {
    super(props);

    this.dbNameCheckReg = /[\\/:*?"<>|]/;

    this.state = {
      newDbName: '',
      isNameInvalid: { newDb: false, renameDb: false },
      isFieldEmpty: { newDb: false, renameDb: false },
      databases: [],
      renameVal: '',
      currentlySelectedDb: { alias: '', path: '' },
    };
  }

  componentDidMount = () => {
    this.getDatabases();
  };

  componentDidUpdate() {
    const { currentDb } = this.context;
    document.title = `Postavke | Trenutna baza : [${currentDb.alias}]`;
  }

  getDatabases = () => {
    window.api
      .invoke('get-databases')
      .then((res: ConfigJSON) => {
        const { currentlySelectedDb } = this.state;
        let { renameVal } = this.state;
        if (
          currentlySelectedDb.path === '' &&
          currentlySelectedDb.alias === ''
        ) {
          currentlySelectedDb.path = res.currentDb.path;
          currentlySelectedDb.alias = res.currentDb.alias;
        }
        if (renameVal === '') {
          renameVal = res.currentDb.alias;
        }
        this.setState({
          databases: res.databases,
          currentlySelectedDb,
          renameVal,
        });
        return res;
      })
      .catch((err: any) => console.log(err));
  };

  onNewDbNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { isNameInvalid, isFieldEmpty } = this.state;
    if (!this.isNameValid(value)) {
      isNameInvalid.newDb = true;
      console.log(`Ime sadrži [\\, /, :, *, ?, ", <, >, |]`);
    } else {
      isNameInvalid.newDb = false;
    }
    if (isFieldEmpty.newDb === true) {
      isFieldEmpty.newDb = false;
    }
    this.setState({ newDbName: value, isNameInvalid, isFieldEmpty });
  };

  isNameValid = (dbName: string): boolean => {
    if (dbName.search(this.dbNameCheckReg) !== -1) {
      return false;
    }
    return true;
  };

  handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const i = event.target.selectedIndex;
    this.setState({
      currentlySelectedDb: {
        path: event.target.value,
        alias: event.target[i].textContent,
      },
      renameVal: event.target[i].textContent,
    });
  };

  handleRenameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { isFieldEmpty } = this.state;
    isFieldEmpty.renameDb = false;
    this.setState({ renameVal: event.target.value, isFieldEmpty });
  };

  renameSelectedDb = () => {
    const { currentlySelectedDb, renameVal, isFieldEmpty } = this.state;
    if (renameVal.trim() === '') {
      isFieldEmpty.renameDb = true;
    } else {
      isFieldEmpty.renameDb = false;
      if (currentlySelectedDb.alias !== renameVal.trim()) {
        currentlySelectedDb.alias = renameVal;
        this.setState({ currentlySelectedDb });
        window.api
          .invoke('rename-database', {
            alias: renameVal,
            path: currentlySelectedDb.path,
          })
          .then((res: any) => {
            const { renameCurrentDb, currentDb } = this.context;
            if (currentDb.path === currentlySelectedDb.path) {
              renameCurrentDb(renameVal);
            }
            this.getDatabases();
            return res;
          })
          .catch((err: any) => console.log(err));
      }
    }
    this.setState({ isFieldEmpty });
  };

  onSetDatabase = () => {
    const { currentlySelectedDb } = this.state;
    window.api
      .invoke('set-database', currentlySelectedDb)
      .then((res) => {
        const { setCurrentDb } = this.context;
        setCurrentDb(currentlySelectedDb);
        return res;
      })
      .catch((err) => console.log(err));
  };

  onCreateDatabase = () => {
    let { currentlySelectedDb } = this.state;
    const { newDbName, databases, isFieldEmpty } = this.state;
    if (newDbName.trim() !== '') {
      const newDb = { alias: newDbName.trim(), path: newDbName.trim() };
      window.api
        .invoke('new-database', newDb)
        .then((res: DatabaseConfigInfo) => {
          databases.push(res);
          currentlySelectedDb = res;
          this.setState({ databases, currentlySelectedDb });
          window.api
            .invoke('set-database', currentlySelectedDb)
            .then((result) => {
              const { setCurrentDb } = this.context;
              setCurrentDb(currentlySelectedDb);
              this.setState({ newDbName: '', renameVal: newDbName.trim() });
              return result;
            })
            .catch((err) => console.log(err));
          return res;
        })
        .catch((err) => console.log(err));
    } else {
      isFieldEmpty.newDb = true;
      this.setState({ isFieldEmpty });
    }
  };

  render() {
    const {
      newDbName,
      isNameInvalid,
      databases,
      renameVal,
      isFieldEmpty,
      currentlySelectedDb,
    } = this.state;
    return (
      <Container>
        <Row>
          <Col className="col-6">
            <Card className="my-2">
              <Card.Body>
                <Card.Title>Odabir baze</Card.Title>
                <div className="dropdown-divider" />
                <Form.Group>
                  <Form.Label>Promjena baze</Form.Label>
                  <Form.Select
                    value={currentlySelectedDb.path}
                    onChange={this.handleSelectChange}
                  >
                    {databases.map((item) => {
                      return (
                        <option key={item.path} value={item.path}>
                          {item.alias}
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Button className="mt-3" onClick={this.onSetDatabase}>
                    <i className="fas fa-save" />
                    <span> Odaberi</span>
                  </Button>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          <Col className="col-6">
            <Card className="my-2">
              <Card.Body>
                <Card.Title>Dodavanje nove baze</Card.Title>
                <div className="dropdown-divider" />
                <Form.Group>
                  <Form.Label>Naziv nove baze</Form.Label>
                  <Form.Control
                    placeholder="Naziv nove baze"
                    value={newDbName}
                    onChange={this.onNewDbNameChange}
                    name="newDb"
                    spellCheck={false}
                    isInvalid={isNameInvalid.newDb || isFieldEmpty.newDb}
                  />
                  <Form.Control.Feedback type="invalid">
                    {isNameInvalid.newDb
                      ? `Polje sadrži nedozvoljene znakove! (\\, /, :, *, ?, ", <, >, |)`
                      : 'Polje nije uneseno!'}
                  </Form.Control.Feedback>
                  <Button
                    className="mt-3"
                    onClick={this.onCreateDatabase}
                    type="button"
                    disabled={isNameInvalid.newDb || isFieldEmpty.newDb}
                  >
                    <i className="fas fa-save" />
                    <span> Dodaj</span>
                  </Button>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col className="col-6">
            <Card className="my-2">
              <Card.Body>
                <Card.Title>Preimenovanje odabrane baze</Card.Title>
                <div className="dropdown-divider" />
                <Form.Group>
                  <Form.Label>Naziv nove baze</Form.Label>
                  <Form.Control
                    placeholder="Naziv"
                    value={renameVal}
                    onChange={this.handleRenameInputChange}
                    name="renameDb"
                    spellCheck={false}
                    isInvalid={isFieldEmpty.renameDb}
                  />
                  <Form.Control.Feedback type="invalid">
                    Polje nije uneseno!
                  </Form.Control.Feedback>

                  <Button
                    className="mt-3"
                    onClick={this.renameSelectedDb}
                    type="button"
                  >
                    <i className="fas fa-save" />
                    <span> Preimenuj</span>
                  </Button>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

SettingsView.contextType = CurrentDatabaseContext;

export default SettingsView;
