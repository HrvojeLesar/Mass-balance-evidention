import React from 'react';
import { Form, Button } from 'react-bootstrap';

export interface FilterProps {
  fields: any;
  table: any;
  removeFilter: any;
}

export interface FilterState {
  selectedField: string;
  selectedFilterBy: string;
  selectedFilterTypes: any;
  value: string;
}

const numberFilterType = ['=', '<', '<=', '>', '>=', '!='];
const stringFilterType = [
  { tabulatorType: 'like', value: 'Poput' },
  { tabulatorType: '=', value: 'Jednako' },
];

const getFilterTypes = (
  input: string
):
  | string[]
  | (
      | string
      | {
          tabulatorType: string;
          value: string;
        }
    )[] => {
  switch (input) {
    case 'number':
    case 'float':
    case 'date':
      return numberFilterType;
    case 'text':
    case 'select':
    case 'bindingSelect':
    default:
      return stringFilterType;
  }
};

class Filter extends React.Component<FilterProps, FilterState> {
  currentFilter: any;

  isFilterApplied: boolean;

  fieldSelectRef: HTMLSelectElement | null;

  constructor(props: FilterProps) {
    super(props);
    this.isFilterApplied = false;
    this.fieldSelectRef = null;
    let selectedFieldValue = '';
    let selectedFilterType = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const field of props.fields) {
      if (field.searchable) {
        selectedFieldValue = field.bindTo;
        selectedFilterType = field.type;
        break;
      }
    }

    const type = getFilterTypes(selectedFilterType)[0].tabulatorType
      ? getFilterTypes(selectedFilterType)[0].tabulatorType
      : getFilterTypes(selectedFilterType)[0];

    this.currentFilter = {
      field: selectedFieldValue,
      type,
      value: '',
    };

    this.state = {
      selectedField: selectedFieldValue,
      selectedFilterBy: type,
      value: '',
      selectedFilterTypes: getFilterTypes(selectedFilterType),
    };
  }

  componentWillUnmount() {
    this.removeFilter();
  }

  handleFieldSelectChange = (event: any) => {
    const selectedField = event.target.value;
    this.removeFilter();
    this.currentFilter.field = selectedField;
    this.addFilter();
    this.setState({ selectedField });
  };

  handleFilterTypesSelectChange = (event: any) => {
    const selectedFilterBy = event.target.value;
    this.removeFilter();
    this.currentFilter.type = selectedFilterBy;
    this.addFilter();
    this.setState({ selectedFilterBy });
  };

  handleInputChange = (event: any) => {
    const value = String(event.target.value);
    this.removeFilter();
    this.currentFilter.value = value.trim();
    this.addFilter();
    this.setState({ value });
  };

  addFilter = () => {
    const { table } = this.props;
    if (this.currentFilter.value !== '') {
      this.isFilterApplied = true;
      table.addFilter([this.currentFilter]);
    }
  };

  removeFilter = () => {
    const { table } = this.props;
    if (this.isFilterApplied) {
      this.isFilterApplied = false;
      table.removeFilter([this.currentFilter]);
    }
  };

  setSelectedFilterTypes = (event: any) => {
    const { selectedFilterTypes } = this.state;
    const { selectedIndex } = event.target;
    const selectFilterType = event.target.options[selectedIndex].dataset.type;
    if (selectFilterType) {
      const newTypes = getFilterTypes(selectFilterType);
      if (newTypes !== selectedFilterTypes) {
        this.removeFilter();
        if (newTypes[0].tabulatorType) {
          this.currentFilter.type = newTypes[0].tabulatorType;
        } else {
          // eslint-disable-next-line prefer-destructuring
          this.currentFilter.type = newTypes[0];
        }
        this.addFilter();
        this.setState({
          selectedFilterTypes: newTypes,
        });
      }
    }
  };

  render() {
    const { fields } = this.props;
    const { selectedField, selectedFilterBy, value, selectedFilterTypes } =
      this.state;
    return (
      <div className="hstack gap-3">
        <Form.Select
          style={{ minWidth: `${100}px` }}
          ref={(r: any) => {
            this.fieldSelectRef = r;
          }}
          value={selectedField}
          onChange={(event) => {
            this.handleFieldSelectChange(event);
            this.setSelectedFilterTypes(event);
          }}
        >
          {fields.map((field: any) => {
            if (field.searchable) {
              return (
                <option
                  key={field.bindTo}
                  value={field.bindTo}
                  data-type={field.type}
                >
                  {field.title}
                </option>
              );
            }
            return null;
          })}
        </Form.Select>

        <Form.Select
          style={{ minWidth: `${100}px` }}
          value={selectedFilterBy}
          onChange={(event) => {
            this.handleFilterTypesSelectChange(event);
          }}
        >
          {selectedFilterTypes.map((filterValue: any) => {
            const type = filterValue.tabulatorType
              ? filterValue.tabulatorType
              : filterValue;
            const val = filterValue.tabulatorType
              ? filterValue.value
              : filterValue;
            return (
              <option key={type} value={val}>
                {val}
              </option>
            );
          })}
        </Form.Select>

        <Form.Control
          style={{ minWidth: `${200}px` }}
          type={
            this.fieldSelectRef?.options[this.fieldSelectRef.selectedIndex]
              .dataset.type === 'date'
              ? 'date'
              : 'text'
          }
          placeholder="Filter..."
          value={value}
          onChange={(event) => {
            this.handleInputChange(event);
          }}
        />

        <div className="vr" style={{ minWidth: `${1}px` }} />

        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            const { removeFilter } = this.props;
            removeFilter();
          }}
        >
          X
        </Button>
      </div>
    );
  }
}

export default Filter;
