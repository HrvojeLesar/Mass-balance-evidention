import React from 'react';
import Select from 'react-select';

export interface BindingSelectProps {
  onSelectChange: any;
  bindTo: string;
  value: any;
  selectData: any;
  isCreatable?: boolean;
  setNewValueHandler: any;
  saveHandler: any;
  isInvalid: boolean;
  selectPlaceholder: string;
  setBoundSelect: any;
  resetBound: any;
}

export interface BindingSelectState {}

class BindingSelect extends React.Component<
  BindingSelectProps,
  BindingSelectState
> {
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

  constructor(props: BindingSelectProps) {
    super(props);
    this.state = {};
  }

  getOptionLabel = (option: any): string => {
    return option.__isNew__ ? option.label : option['naziv'];
  };

  getOptionValue = (option: any): string => {
    return option.__isNew__ ? option.value : option['id'];
  };

  onChangeHandler = (newValue: any, actionMeta: any) => {
    const { onSelectChange, resetBound } = this.props;
    onSelectChange(newValue, actionMeta);
    if (actionMeta.action === 'select-option') {
      this.setBoundSelect(newValue.id);
    } else if (actionMeta.action === 'clear') {
      resetBound();
    }
  };

  setBoundSelect = (id: any) => {
    const { setBoundSelect } = this.props;
    setBoundSelect(id);
  };

  render() {
    const { bindTo, value, selectData, selectPlaceholder, isInvalid } =
      this.props;
    return (
      <>
        <Select
          className={`${isInvalid ? 'is-invalid' : undefined}`}
          isClearable
          onChange={this.onChangeHandler}
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
        <div className="invalid-feedback">Polje nije odabrano!</div>
      </>
    );
  }
}

export default BindingSelect;
