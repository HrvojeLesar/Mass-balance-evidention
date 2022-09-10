import * as React from 'react';
import CountedDeleteButton from './CountedDeleteButton';
import DeleteConfirmation from './DeleteConfirmationModal';

export interface DeleteSelectedRowsProps {
  deleteFunction: any;
}

export interface DeleteSelectedRowsState {
  numSelected: number;
}

class DeleteSelectedRows extends React.Component<
  DeleteSelectedRowsProps,
  DeleteSelectedRowsState
> {
  modalRef: DeleteConfirmation | null;

  constructor(props: DeleteSelectedRowsProps) {
    super(props);
    this.modalRef = null;
    this.state = {
      numSelected: 0,
    };
  }

  updateSelectedRowsNumber = (table: any) => {
    let num = table.getSelectedData().length;
    if (!num) {
      num = 0;
    }
    this.setState({ numSelected: num });
  };

  render() {
    const { numSelected } = this.state;
    const { deleteFunction } = this.props;
    return (
      <>
        <CountedDeleteButton
          numSelected={numSelected}
          displayModal={this.modalRef?.displayModal}
        />
        <DeleteConfirmation
          ref={(r) => {
            this.modalRef = r;
          }}
          deleteFunction={deleteFunction}
          numSelected={numSelected}
        />
      </>
    );
  }
}

export default DeleteSelectedRows;
