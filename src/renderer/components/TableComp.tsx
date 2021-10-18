/* eslint-disable no-restricted-syntax */
import React from 'react';
import { render as rRender } from 'react-dom';

import { ReactTabulator } from 'react-tabulator';

import { Button, Card, Col, Form, Row } from 'react-bootstrap';

import { Table } from '../tables/tableConfigInterface';
import Search from './Search';
import GroupBy from './GroupBy';
import Inputs from './Inputs';
import EditSelectedModal from './EditSelectedModal';
import DeleteSelectedRows from './DeleteSelectedRows';
import Filters from './Filters';
import createToast, { ToastType } from './ToastUtil';

export interface TableCompProps {
  title: string;
  tableConfig: Table;
  data: any[];
  del?: (rowIndex: number) => Promise<any>;
  insert?: (row: any) => Promise<any>;
  update?: (newValues: any, oldRow: any) => Promise<any>;
  additionalTableData?: { [key: string]: any };
  customRowFormatter?: any;
  updateData?: any;
}

interface TableCompState {}

class TableComp extends React.Component<TableCompProps, TableCompState> {
  tableRef: ReactTabulator | null;

  inputsRef: Inputs | null;

  editSelectedModalRef: EditSelectedModal | null;

  deleteSelectedRowsRef: DeleteSelectedRows | null;

  constructor(props: TableCompProps) {
    super(props);
    this.tableRef = null;
    this.inputsRef = null;
    this.editSelectedModalRef = null;
    this.deleteSelectedRowsRef = null;
  }

  handleDelete = async () => {
    const { del } = this.props;
    let numDeleted = 0;
    let numErrored = 0;

    if (del) {
      const promises: Promise<any>[] = [];
      this.tableRef?.table.getSelectedRows().forEach((row: any) => {
        promises.push(del(row));
      });

      Promise.allSettled(promises)
        .then((results) => {
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              numDeleted += 1;
              result.value.delete();
            } else {
              numErrored += 1;
            }
          });
          return results;
        })
        .then((nekaj) => {
          const { updateData } = this.props;
          updateData(this.tableRef?.table.getData());
          if (numErrored === 0 && numDeleted > 0) {
            createToast(
              `Svi odabrani redovi obrisani! Broj obrisanih redova: ${numDeleted}`,
              ToastType.Success
            );
            console.log(
              `Svi odabrani redovi obrisani! Broj obrisanih redova: ${numDeleted}`
            );
          } else if (numErrored > 0 && numDeleted > 0) {
            createToast(
              `Neki redovi nisu obrisani! Broj obrisanih redova: [${numDeleted}], broj ne obrisanih redova [${numErrored}]`,
              ToastType.Warning
            );
            console.log(
              `Neki redovi nisu obrisani! Broj obrisanih redova: [${numDeleted}], broj ne obrisanih redova [${numErrored}]`
            );
          } else if (numErrored > 0 && numDeleted === 0) {
            createToast(
              `Nije moguće obrisati odabrane redove!`,
              ToastType.Error
            );
            console.log(`Nije moguće obrisati odabrane redove!`);
          }
          return nekaj;
        })
        .catch((err) => console.log(err));
    }
  };

  renderFn = (cell: any) => {
    const cellEl = cell.getElement();
    if (cellEl) {
      const formatterCell = cellEl.querySelector('.formatterCell');
      if (formatterCell) {
        rRender(
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={() => {
              this.editSelectedModalRef?.displayModal(cell._cell.row.data);
            }}
          >
            <i className="fas fa-edit" />
          </button>,
          formatterCell
        );
      }
    }
  };

  editButtonColumn = () => {
    return {
      title: 'Akcije',
      field: 'actions',
      hozAlign: 'center',
      formatter: (
        cell: any,
        formatterParams: any,
        onRendered: (callback: () => void) => void
      ) => {
        onRendered(() => this.renderFn(cell));
        return '<div class="formatterCell"></div>';
      },
    };
  };

  getTableColumns = () => {
    const { update, tableConfig } = this.props;
    if (update) {
      return [...tableConfig.columns, this.editButtonColumn()];
    }
    return tableConfig.columns;
  };

  render() {
    const {
      title,
      tableConfig,
      data,
      additionalTableData,
      customRowFormatter,
      insert,
      update,
      del,
    } = this.props;
    const displayGroupBy = tableConfig.groups ? (
      <GroupBy
        table={this.tableRef?.table}
        availableGroups={tableConfig.groups}
      />
    ) : null;
    const tableColumns = this.getTableColumns();
    return (
      <Card className="my-2 shadow">
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <div className="dropdown-divider" />

          {insert && (
            <>
              <Inputs
                ref={(r) => {
                  this.inputsRef = r;
                }}
                tableConfig={tableConfig}
                additionalTableData={additionalTableData}
                customRowFormatter={customRowFormatter}
                insert={insert}
              />
              <Button
                className="mt-3"
                variant="success"
                onClick={() => {
                  this.inputsRef?.handleSave();
                }}
              >
                <i className="fas fa-save" />
                <span> Spremi</span>
              </Button>
              <div className="dropdown-divider" />
            </>
          )}

          <Row className="mb-3">
            <Col className={`${displayGroupBy ? 'col-10' : 'col-12'}`}>
              <div className="hstack gap-4">
                <Search
                  table={this.tableRef?.table}
                  columns={tableConfig.inputs}
                />
                <Form.Group>
                  <Form.Label>Filter</Form.Label>
                  <Filters
                    table={this.tableRef?.table}
                    fields={tableConfig.inputs}
                  />
                </Form.Group>
              </div>
            </Col>
            {displayGroupBy && <Col className="col-2">{displayGroupBy}</Col>}
          </Row>

          <ReactTabulator
            ref={(ref) => {
              this.tableRef = ref;
            }}
            columns={tableColumns}
            data={data}
            options={tableConfig.options}
            rowSelectionChanged={() => {
              this.deleteSelectedRowsRef?.updateSelectedRowsNumber(
                this.tableRef?.table
              );
            }}
          />

          {del && (
            <>
              <DeleteSelectedRows
                ref={(r) => {
                  this.deleteSelectedRowsRef = r;
                }}
                deleteFunction={this.handleDelete}
              />
            </>
          )}
          {update && (
            <>
              <EditSelectedModal
                ref={(r) => {
                  this.editSelectedModalRef = r;
                }}
                updateFunction={update}
                inputs={this.inputsRef?.state.inputs}
                tableConfig={tableConfig}
                additionalTableData={additionalTableData}
              />
            </>
          )}
        </Card.Body>
      </Card>
    );
  }
}

export default TableComp;
