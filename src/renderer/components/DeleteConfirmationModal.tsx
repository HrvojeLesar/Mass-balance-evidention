import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export interface DeleteConfirmationProps {
  numSelected: number;
  deleteFunction: () => void;
}

export interface DeleteConfirmationState {
  isDisplayed: boolean;
}

class DeleteConfirmation extends React.Component<
  DeleteConfirmationProps,
  DeleteConfirmationState
> {
  constructor(props: DeleteConfirmationProps) {
    super(props);
    this.state = { isDisplayed: false };
  }

  displayModal = () => {
    const { isDisplayed } = this.state;
    if (!isDisplayed) {
      this.setState({ isDisplayed: true });
    }
  };

  closeModal = () => {
    const { isDisplayed } = this.state;
    if (isDisplayed) {
      this.setState({ isDisplayed: false });
    }
  };

  render() {
    const { isDisplayed } = this.state;
    const { deleteFunction, numSelected } = this.props;
    let selectedMessage;
    let confirmButtonLabel;
    if (numSelected === 1) {
      selectedMessage = `Jeste li sigurni da želite obrisati ${numSelected} red ?`;
      confirmButtonLabel = `Obriši ${numSelected} red`;
    } else {
      selectedMessage = `Jeste li sigurni da želite obrisati ${numSelected} redova ?`;
      confirmButtonLabel = `Obriši ${numSelected} redova`;
    }
    return (
      <Modal show={isDisplayed} onHide={this.closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Potvrda brisanja!</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.closeModal}>
            Odustani
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteFunction();
              this.closeModal();
            }}
          >
            {confirmButtonLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteConfirmation;
