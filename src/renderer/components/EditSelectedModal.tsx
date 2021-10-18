import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Table } from '../tables/tableConfigInterface';
import Inputs from './Inputs';
import createToast, { ToastType } from './ToastUtil';

export interface EditSelectedModalProps {
  tableConfig: Table;
  additionalTableData: { [key: string]: any } | undefined;
  updateFunction: (newValues: any, oldRow: any) => Promise<any>;
  inputs: any;
}

export interface EditSelectedModalState {
  data: any;
  isDisplayed: boolean;
}

class EditSelectedModal extends React.Component<
  EditSelectedModalProps,
  EditSelectedModalState
> {
  inputsRef: Inputs | null;

  constructor(props: EditSelectedModalProps) {
    super(props);
    this.inputsRef = null;
    this.state = {
      isDisplayed: false,
      data: {},
    };
  }

  displayModal = (data: any = null) => {
    const { isDisplayed } = this.state;
    if (!isDisplayed) {
      this.setState({ isDisplayed: true, data });
    }
  };

  closeModal = () => {
    const { isDisplayed } = this.state;
    if (isDisplayed) {
      this.setState({ isDisplayed: false });
    }
  };

  render() {
    const { isDisplayed, data } = this.state;
    const { tableConfig, additionalTableData, updateFunction } = this.props;
    return (
      <>
        <Modal
          show={isDisplayed}
          onHide={this.closeModal}
          backdrop="static"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Uređivanje</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Inputs
              ref={(r) => {
                this.inputsRef = r;
              }}
              tableConfig={tableConfig}
              additionalTableData={additionalTableData}
              rowData={data}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Odustani
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const result = this.inputsRef?.handleUpdate();
                if (result) {
                  updateFunction(result[0], result[1])
                    .then((res) => {
                      if (res === -1) {
                        createToast('Red već postoji', ToastType.Error);
                      } else {
                        this.closeModal();
                      }
                      return res;
                    })
                    .catch((err) => console.log(err));
                }
              }}
            >
              Spremi promjene
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default EditSelectedModal;
