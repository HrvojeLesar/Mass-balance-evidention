import { Table as ITable } from '../tables/tableConfigInterface';

export type TableConfigData = { tableConfig: ITable; data: any[] };

export const loadData = (
  state: any,
  loadFunction: any,
  setState: () => void,
  args: any = undefined
) => {
  loadFunction(args)
    .then((res: any[]) => {
      state.data = res;
      setState();
      return res;
    })
    .catch((err: Error) => err);
};

export const handleSave = async (
  row: any,
  saveFunction: any,
  chosenTable: TableConfigData,
  setState: () => void
) => {
  const result = await saveFunction(row)
    .then((res: any) => {
      if (res.changes >= 1) {
        const { primaryKey } = chosenTable.tableConfig;
        if (primaryKey) {
          row[primaryKey] = res.lastID;
        }
        chosenTable.data.unshift(row);
        setState();
      }
      return row;
    })
    .catch((err: Error) => {
      console.log(err);
      return -1;
    });
  return result;
};

export const handleUpdate = async (
  newValues: any,
  oldRow: any,
  updateFunction: any,
  updateRowFunction: any,
  setState: () => void
) => {
  const result = await updateFunction(newValues, oldRow)
    .then((res: any) => {
      console.log(res);
      updateRowFunction(newValues, oldRow);
      setState();
      return oldRow;
    })
    .catch((err: Error) => {
      console.log(err);
      return -1;
    });
  return result;
};

export const handleDelete = async (
  tabulatorRow: any,
  delFunction: any,
  chosenTable: TableConfigData,
  setState: () => void
) => {
  return delFunction(tabulatorRow.getData())
    .then((res: any) => {
      if (res.changes >= 1) {
        setState();
        return tabulatorRow;
      }
      throw new Error('No changes made');
    })
    .catch((err: Error) => {
      throw err;
    });
};

export const floatCommaToDot = (input: string) => {
  return input.toString().replace(',', '.');
};

export const checkFloat = (input: string) => {
  const val = Number(floatCommaToDot(input));
  if (!Number.isNaN(val)) {
    return true;
  }
  return false;
};
