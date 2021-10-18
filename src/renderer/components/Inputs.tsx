/* eslint-disable no-restricted-syntax */

import React from 'react';
import { Col, Row, Form } from 'react-bootstrap';

import { Table } from '../tables/tableConfigInterface';
import { checkFloat, floatCommaToDot } from '../views/utils';
import BindingSelect from './BindingSelect';
import SelectInput from './SelectInput';
import TableInput from './TableInput';
import createToast, { ToastType } from './ToastUtil';

export interface InputsProps {
  tableConfig: Table;
  additionalTableData?: { [key: string]: any };
  insert?: any;
  customRowFormatter?: any;
  rowData?: any;
}

export interface InputsState {
  inputs: {
    [key: string]: {
      isInvalid: boolean;
      value: any;
      insertable: boolean;
      type: string;
      skipClearing: boolean;
      dataIdentifier?: string;
      ref?: any;
    };
  };
  rowData: any;
}

class Inputs extends React.Component<InputsProps, InputsState> {
  constructor(props: InputsProps) {
    super(props);

    const inputs = {};
    props.tableConfig.inputs.forEach((input) => {
      inputs[input.bindTo] = {
        isInvalid: false,
        value: '',
        insertable: input.insertable,
        type: input.type,
        skipClearing: input.type === 'bindingSelect',
        dataIdentifier: input.dataIdentifier,
      };
    });

    this.state = { inputs, rowData: null };
  }

  componentDidMount() {
    const { rowData } = this.props;
    if (rowData) {
      this.setInputs(rowData);
    }
  }

  handleInputChange = (event: React.ChangeEvent) => {
    const targetName = event.target.name;
    const targetValue = event.target.value;
    const { inputs } = this.state;
    inputs[targetName].value = targetValue;
    inputs[targetName].isInvalid = false;
    this.setState({ inputs });
  };

  handleSelectChange = (newValue: any, actionMeta: any) => {
    const { inputs } = this.state;
    inputs[actionMeta.name].value = newValue;
    inputs[actionMeta.name].isInvalid = false;
    this.setState({ inputs });
  };

  handleInvalidFloat = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetName = event.target.name;
    const { inputs } = this.state;
    inputs[targetName].isInvalid = true;
    this.setState({ inputs });
  };

  setNewValue = (newValue: any, name: any) => {
    const { inputs } = this.state;
    inputs[name].value = newValue;
    this.setState({ inputs });
  };

  validate = (): boolean => {
    let isValid = true;
    const { inputs } = this.state;
    /* eslint-disable-next-line no-restricted-syntax */
    for (const key in inputs) {
      if (inputs[key].insertable) {
        if (
          inputs[key].value === null ||
          inputs[key].value.toString().trim() === '' ||
          (inputs[key].type === 'float' && !checkFloat(inputs[key].value))
        ) {
          inputs[key].isInvalid = true;
          isValid = false;
        }
      }
    }
    // TODO: premeniti jer celu komponentu rerendera
    this.setState({ inputs });
    return isValid;
  };

  handleSave = async () => {
    const { inputs } = this.state;
    const { insert, customRowFormatter } = this.props;
    if (this.validate()) {
      let row = {};
      /* eslint-disable-next-line no-restricted-syntax, guard-for-in */
      for (const key in inputs) {
        if (inputs[key].insertable) {
          if (inputs[key].type === 'float') {
            row[key] = floatCommaToDot(inputs[key].value);
          } else {
            row[key] = inputs[key].value;
          }
        }
      }
      if (customRowFormatter) {
        row = customRowFormatter(row);
      }
      const inserted = await insert(row);
      if (inserted !== -1) {
        this.clearInputs();
        createToast('Red uspješno dodan!', ToastType.Success);
      } else {
        createToast('Red već postoji!', ToastType.Error);
      }
    } else {
      // Err
    }
  };

  clearInputs = () => {
    const { inputs } = this.state;
    for (const key in inputs) {
      if (inputs[key].insertable && !inputs[key].skipClearing) {
        inputs[key].value = '';
      }
    }
    this.setState({ inputs });
  };

  setInputs = (data: any) => {
    const { inputs } = this.state;
    for (const dataKey in data) {
      if (inputs[dataKey]) {
        if (inputs[dataKey].dataIdentifier) {
          const idIndexString = 'id_'.concat(inputs[dataKey].dataIdentifier);
          inputs[dataKey].value = {
            id: data[idIndexString],
            naziv: data[dataKey],
          };
        } else {
          inputs[dataKey].value = data[dataKey];
        }
        if (inputs[dataKey].type === 'bindingSelect') {
          inputs[dataKey].ref?.setBoundSelect(inputs[dataKey].value.id);
        }
      }
    }
    this.setState({ inputs, rowData: data });
  };

  handleUpdate = () => {
    const { inputs, rowData } = this.state;
    const { customRowFormatter } = this.props;
    if (this.validate()) {
      let row = {};
      /* eslint-disable-next-line no-restricted-syntax, guard-for-in */
      for (const key in inputs) {
        if (inputs[key].insertable) {
          if (inputs[key].type === 'float') {
            row[key] = floatCommaToDot(inputs[key].value);
          } else {
            row[key] = inputs[key].value;
          }
        }
      }
      if (customRowFormatter) {
        row = customRowFormatter(row);
      }
      return [row, rowData];
    }
    return undefined;
  };

  resetInvalidInputs = () => {
    const { inputs } = this.state;
    /* eslint-disable-next-line no-restricted-syntax, guard-for-in */
    for (const key in inputs) {
      inputs[key].isInvalid = false;
    }
    this.setState({ inputs });
  };

  calculateColumnWidth = (index: number, inputsNum: number) => {
    if (inputsNum % 2 && (inputsNum === 1 || inputsNum === index + 1)) {
      return 'col-12 mb-2';
    }
    return 'col-6 mb-2';
  };

  render() {
    const { tableConfig, additionalTableData } = this.props;
    const { inputs } = this.state;
    let index = 0;
    const insertableNum = tableConfig.inputs.filter(
      (input) => input.insertable
    ).length;
    return (
      <Row>
        {tableConfig.inputs.map((input) => {
          if (input.insertable) {
            const colWidth = this.calculateColumnWidth(index, insertableNum);
            index += 1;
            switch (input.type) {
              case 'select':
              case 'creatableSelect': {
                const isCreatable = input.type === 'creatableSelect';
                if (input.dataIdentifier && additionalTableData) {
                  return (
                    <Col className={colWidth} key={input.bindTo}>
                      <Form.Group>
                        <Form.Label>{input.title}</Form.Label>
                        <SelectInput
                          onSelectChange={this.handleSelectChange}
                          bindTo={input.bindTo}
                          selectData={
                            additionalTableData[input.dataIdentifier].data
                          }
                          value={inputs[input.bindTo].value}
                          setNewValueHandler={this.setNewValue}
                          saveHandler={
                            additionalTableData[input.dataIdentifier].save
                          }
                          isInvalid={inputs[input.bindTo].isInvalid}
                          selectPlaceholder={
                            input.selectPlaceholder || 'Odabir...'
                          }
                          isCreatable={isCreatable}
                        />
                      </Form.Group>
                    </Col>
                  );
                }
                return null;
              }
              case 'bindingSelect': {
                if (input.dataIdentifier && additionalTableData) {
                  return (
                    <Col className={colWidth} key={input.bindTo}>
                      <Form.Group>
                        <Form.Label>{input.title}</Form.Label>
                        <BindingSelect
                          ref={(r) => {
                            inputs[input.bindTo].ref = r;
                          }}
                          onSelectChange={this.handleSelectChange}
                          bindTo={input.bindTo}
                          selectData={
                            additionalTableData[input.dataIdentifier].data
                          }
                          value={inputs[input.bindTo].value}
                          setNewValueHandler={this.setNewValue}
                          saveHandler={
                            additionalTableData[input.dataIdentifier].save
                          }
                          isInvalid={inputs[input.bindTo].isInvalid}
                          selectPlaceholder={
                            input.selectPlaceholder || 'Odabir...'
                          }
                          setBoundSelect={
                            additionalTableData[input.dataIdentifier].setBound
                          }
                          resetBound={
                            additionalTableData[input.dataIdentifier].resetData
                          }
                        />
                      </Form.Group>
                    </Col>
                  );
                }
                return null;
              }
              default: {
                return (
                  <Col className={colWidth} key={input.bindTo}>
                    <TableInput
                      title={input.title}
                      bindTo={input.bindTo}
                      isInvalid={inputs[input.bindTo].isInvalid}
                      value={inputs[input.bindTo].value}
                      onChange={this.handleInputChange}
                      isFloat={input.type === 'float'}
                      isDate={input.type === 'date'}
                      setInvalidFloat={this.handleInvalidFloat}
                    />
                  </Col>
                );
              }
            }
          }
          return null;
        })}
      </Row>
    );
  }
}

export default Inputs;
