export interface Table {
  columns: any[];
  inputs: {
    title: string;
    bindTo: string;
    insertable: boolean;
    searchable: boolean;
    type:
      | 'text'
      | 'select'
      | 'date'
      | 'select'
      | 'creatableSelect'
      | 'float'
      | 'bindingSelect';
    dataIdentifier?: string;
    newSelectRow?: any;
    selectPlaceholder?: string;
  }[];
  options: any;
  primaryKey?: string;
  groups?: {
    title: string;
    field: string;
    default?: boolean;
  }[];
  // load: () => Promise<any[]>;
  // save: (row: any) => Promise<{ lastID: number; changes: number }>;
  // delete: (row: any) => Promise<{ lastID: number; changes: number }>;
}
