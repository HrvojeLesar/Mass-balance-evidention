import * as React from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';

export interface SelectProps {
  onSelectChange: any;
  bindTo: string;
  value: any;
  selectData: any;
  isCreatable?: boolean;
  setNewValueHandler: any;
  saveHandler: any;
  isInvalid: boolean;
  selectPlaceholder: string;
}

export interface SelectState {}

class SelectInput extends React.Component<SelectProps, SelectState> {
  customStyles = {
    control: (provided, state) => {
      const { isInvalid } = this.props;
      return {
        ...provided,
        borderColor: isInvalid ? 'red' : provided.borderColor,
        ':hover': {
          borderColor: isInvalid ? 'red' : provided.borderColor,
        },
      };
    },
  };

  constructor(props: SelectProps) {
    super(props);
    this.state = {};
  }

  getOptionLabel = (option: any): string => {
    return option.__isNew__ ? option.label : option['naziv'];
  };

  getOptionValue = (option: any): string => {
    return option.__isNew__ ? option.value : option['id'];
  };

  render() {
    const {
      isCreatable,
      bindTo,
      value,
      selectData,
      onSelectChange,
      setNewValueHandler,
      saveHandler,
      selectPlaceholder,
      isInvalid,
    } = this.props;
    let select;
    const isInvalidClass = isInvalid ? 'is-invalid' : undefined;
    if (isCreatable) {
      select = (
        <CreatableSelect
          className={isInvalidClass}
          isClearable
          onChange={onSelectChange}
          name={bindTo}
          value={value}
          options={selectData}
          getOptionLabel={this.getOptionLabel}
          getOptionValue={this.getOptionValue}
          formatCreateLabel={(inputValue) => {
            return `Kreiraj: ${inputValue}`;
          }}
          onCreateOption={async (inputValue) => {
            const newInputValue = await saveHandler({ naziv: inputValue });
            setNewValueHandler(newInputValue, bindTo);
          }}
          styles={this.customStyles}
          placeholder={selectPlaceholder}
          noOptionsMessage={() => {
            return 'Nema opcija';
          }}
        />
      );
    } else {
      select = (
        <Select
          className={isInvalidClass}
          isClearable
          onChange={onSelectChange}
          name={bindTo}
          value={value}
          options={selectData}
          getOptionLabel={this.getOptionLabel}
          getOptionValue={this.getOptionValue}
          styles={this.customStyles}
          placeholder={selectPlaceholder}
          noOptionsMessage={() => {
            return 'Nema opcija';
          }}
        />
      );
    }
    return (
      <>
        {select}
        <div className="invalid-feedback">Polje nije odabrano!</div>
      </>
    );
  }
}

export default SelectInput;
