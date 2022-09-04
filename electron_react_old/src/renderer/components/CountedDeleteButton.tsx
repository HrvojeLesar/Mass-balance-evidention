import * as React from 'react';
import { Button } from 'react-bootstrap';

export interface CountedDeleteButtonProps {
  numSelected: number;
  displayModal: any;
}

export interface CountedDeleteButtonState {}

class CountedDeleteButton extends React.Component<
  CountedDeleteButtonProps,
  CountedDeleteButtonState
> {
  constructor(props: CountedDeleteButtonProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { numSelected, displayModal } = this.props;
    return (
      <Button
        className="btn-danger"
        onClick={displayModal}
        type="button"
        disabled={numSelected === 0}
      >
        <i className="fas fa-trash" />
        <span> Obriši odabrane redove</span>
      </Button>
    );
  }
}

export default CountedDeleteButton;
