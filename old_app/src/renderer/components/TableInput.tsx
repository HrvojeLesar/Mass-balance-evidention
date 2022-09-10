import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import { checkFloat } from '../views/utils';

export interface TableInputProps {
  title: string;
  bindTo: string;
  value: any;
  isInvalid: boolean;
  onChange: (event: React.ChangeEvent) => void;
  isFloat?: boolean;
  isDate?: boolean;
  setInvalidFloat: any;
}

export interface TableInputState {
  isInvalidFloat: boolean;
}

class TableInput extends React.Component<TableInputProps, TableInputState> {
  constructor(props: TableInputProps) {
    super(props);
    this.state = { isInvalidFloat: false };
  }

  updateInvalidFloat = (state: boolean) => {
    let { isInvalidFloat } = this.state;
    isInvalidFloat = state;
    this.setState({ isInvalidFloat });
  };

  render() {
    const {
      title,
      bindTo,
      value,
      isInvalid,
      onChange,
      isFloat,
      isDate,
      setInvalidFloat,
    } = this.props;
    const { isInvalidFloat } = this.state;

    return (
      <Form.Group>
        <Form.Label>{title}</Form.Label>
        <Form.Control
          type={`${isDate ? 'date' : 'text'}`}
          name={bindTo}
          value={value}
          onChange={(event) => {
            onChange(event);
            if (isFloat) {
              const input = event.target.value;
              if (input !== '' && !checkFloat(input)) {
                this.updateInvalidFloat(true);
                setInvalidFloat(event);
              } else {
                this.updateInvalidFloat(false);
              }
            }
          }}
          isInvalid={isInvalid || isInvalidFloat}
          placeholder={title}
          spellCheck={false}
        />
        <Form.Control.Feedback type="invalid">
          {isInvalidFloat ? 'Polje nije broj!' : 'Polje nije uneseno!'}
        </Form.Control.Feedback>
      </Form.Group>
    );
  }
}

export default TableInput;
