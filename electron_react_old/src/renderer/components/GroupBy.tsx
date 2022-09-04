import React from 'react';
import { Form } from 'react-bootstrap';
import { ReactTabulator } from 'react-tabulator';

export interface GroupByProps {
  table: ReactTabulator;
  availableGroups: any;
}

export interface GroupByState {
  selectedValue: any;
}

class GroupBy extends React.Component<GroupByProps, GroupByState> {
  constructor(props: GroupByProps) {
    super(props);
    const { availableGroups } = this.props;
    const defaultValue = availableGroups.find(
      (item: any) => item.default === true
    );
    if (defaultValue) {
      this.state = { selectedValue: defaultValue.field };
    } else {
      this.state = { selectedValue: '' };
    }
  }

  handleChange = (event) => {
    const selectedGroup = event.target.value;
    this.setTableGroup(selectedGroup);
    this.setState({ selectedValue: selectedGroup });
  };

  setTableGroup = (group) => {
    const { table } = this.props;
    table.setGroupBy(group);
  };

  render() {
    const { availableGroups } = this.props;
    const { selectedValue } = this.state;
    return (
      <Form.Group>
        <Form.Label>Grupiranje</Form.Label>
        <Form.Select value={selectedValue} onChange={this.handleChange}>
          <option value="">Isključeno</option>
          {availableGroups.map((group: any) => {
            return (
              <option key={group.field} value={group.field}>
                {group.title}
              </option>
            );
          })}
        </Form.Select>
      </Form.Group>
    );
  }
}

export default GroupBy;
