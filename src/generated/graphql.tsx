import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch("http://localhost:8000/graphiql", {
    method: "POST",
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * Implement the DateTime<FixedOffset> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: any;
};

export type AllCellCulturePairs = {
  __typename?: 'AllCellCulturePairs';
  results: Array<CellCulturePair>;
  total: Scalars['Int'];
};

export type AllEntires = {
  __typename?: 'AllEntires';
  results: Array<Entry>;
  total: Scalars['Int'];
};

export type Buyer = {
  __typename?: 'Buyer';
  address?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  dGroup?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
};

export type BuyerFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<BuyerFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<BuyerOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum BuyerFields {
  Address = 'ADDRESS',
  Contact = 'CONTACT',
  Id = 'ID',
  Name = 'NAME'
}

export type BuyerFilterOptions = {
  field: BuyerFields;
  fieldType: FieldTypes;
  value: Scalars['String'];
};

export type BuyerInsertOptions = {
  address?: InputMaybe<Scalars['String']>;
  contact?: InputMaybe<Scalars['String']>;
  dGroup?: InputMaybe<Scalars['Int']>;
  name: Scalars['String'];
};

export type BuyerOrderingOptions = {
  order: Ordering;
  orderBy: BuyerFields;
};

export type BuyerResult = {
  __typename?: 'BuyerResult';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<Buyer>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type BuyerUpdateOptions = {
  address?: InputMaybe<Scalars['String']>;
  contact?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type Cell = {
  __typename?: 'Cell';
  createdAt: Scalars['DateTime'];
  dGroup?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CellCultureFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CellCultureFilterOptions>>;
  id?: InputMaybe<CellCulturePairIds>;
  ordering?: InputMaybe<CellCultureOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export type CellCultureFilterOptions = {
  field: CellCulturePairFields;
  fieldType: FieldTypes;
  value: Scalars['String'];
};

export type CellCultureOrderingOptions = {
  order: Ordering;
  orderBy: CellCulturePairFields;
};

export type CellCulturePair = {
  __typename?: 'CellCulturePair';
  cell: Cell;
  createdAt: Scalars['DateTime'];
  culture: Culture;
  dGroup: DataGroup;
};

export type CellCulturePairDeleteOptions = {
  id: CellCulturePairIds;
};

export enum CellCulturePairFields {
  CellDescription = 'CELL_DESCRIPTION',
  CellName = 'CELL_NAME',
  CultureDescription = 'CULTURE_DESCRIPTION',
  CultureName = 'CULTURE_NAME'
}

export type CellCulturePairIds = {
  dGroup: Scalars['Int'];
  idCell: Scalars['Int'];
  idCulture: Scalars['Int'];
};

export type CellCulturePairResult = {
  __typename?: 'CellCulturePairResult';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<CellCulturePair>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type CellCulturePairUpdateOptions = {
  idCellNew: Scalars['Int'];
  idCellOld: Scalars['Int'];
  idCultureNew: Scalars['Int'];
  idCultureOld: Scalars['Int'];
  idDGroup: Scalars['Int'];
};

export type CellFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CellFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CellOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum CellFields {
  Description = 'DESCRIPTION',
  Id = 'ID',
  Name = 'NAME'
}

export type CellFilterOptions = {
  field: CellFields;
  fieldType: FieldTypes;
  value: Scalars['String'];
};

export type CellInsertOptions = {
  dGroup?: InputMaybe<Scalars['Int']>;
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CellOrderingOptions = {
  order: Ordering;
  orderBy: CellFields;
};

export type CellParity = {
  /** Id refers to a Culture Id */
  idCulture: Scalars['Int'];
};

export type CellParityFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CellFilterOptions>>;
  id: CellParity;
  ordering?: InputMaybe<CellOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export type CellResult = {
  __typename?: 'CellResult';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<Cell>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type CellUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type Culture = {
  __typename?: 'Culture';
  createdAt: Scalars['DateTime'];
  dGroup?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CultureFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CultureFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CultureOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum CultureFields {
  Description = 'DESCRIPTION',
  Id = 'ID',
  Name = 'NAME'
}

export type CultureFilterOptions = {
  field: CultureFields;
  fieldType: FieldTypes;
  value: Scalars['String'];
};

export type CultureInsertOptions = {
  dGroup?: InputMaybe<Scalars['Int']>;
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CultureOrderingOptions = {
  order: Ordering;
  orderBy: CultureFields;
};

export type CultureParity = {
  /** Id refers to a Cell Id */
  idCell: Scalars['Int'];
};

export type CultureParityFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CultureFilterOptions>>;
  id: CultureParity;
  ordering?: InputMaybe<CultureOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export type CultureResult = {
  __typename?: 'CultureResult';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<Culture>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type CultureUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type DataGroup = {
  __typename?: 'DataGroup';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type DataGroupFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<DataGroupFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<DataGroupOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum DataGroupFields {
  Description = 'DESCRIPTION',
  Id = 'ID',
  Name = 'NAME'
}

export type DataGroupFilterOptions = {
  field: DataGroupFields;
  fieldType: FieldTypes;
  value: Scalars['String'];
};

export type DataGroupInsertOptions = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type DataGroupOrderingOptions = {
  order: Ordering;
  orderBy: DataGroupFields;
};

export type DataGroupResult = {
  __typename?: 'DataGroupResult';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<DataGroup>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type DataGroupUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type DeleteOptions = {
  id: Scalars['Int'];
};

export type Entry = {
  __typename?: 'Entry';
  buyer?: Maybe<Buyer>;
  cell: Cell;
  createdAt: Scalars['DateTime'];
  culture: Culture;
  dGroup?: Maybe<DataGroup>;
  date: Scalars['DateTime'];
  id: Scalars['Int'];
  weight?: Maybe<Scalars['Float']>;
  weightType?: Maybe<Scalars['String']>;
};

export type EntryFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<EntryFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<EntryOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum EntryFields {
  BuyerAddress = 'BUYER_ADDRESS',
  BuyerContact = 'BUYER_CONTACT',
  BuyerName = 'BUYER_NAME',
  CellDescription = 'CELL_DESCRIPTION',
  CellName = 'CELL_NAME',
  CultureDescription = 'CULTURE_DESCRIPTION',
  CultureName = 'CULTURE_NAME',
  Date = 'DATE',
  Id = 'ID',
  Weight = 'WEIGHT'
}

export type EntryFilterOptions = {
  field: EntryFields;
  fieldType: FieldTypes;
  value: Scalars['String'];
};

export type EntryInsertOptions = {
  cellCulturePair: CellCulturePairIds;
  dGroup?: InputMaybe<Scalars['Int']>;
  date: Scalars['DateTime'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
};

export type EntryOrderingOptions = {
  order: Ordering;
  orderBy: EntryFields;
};

export type EntryResult = {
  __typename?: 'EntryResult';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<Entry>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type EntryUpdateOptions = {
  cellCulturePair?: InputMaybe<CellCulturePairIds>;
  dGroup?: InputMaybe<Scalars['Int']>;
  date?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
};

export enum FieldTypes {
  Date = 'DATE',
  Number = 'NUMBER',
  String = 'STRING'
}

export type MutationRoot = {
  __typename?: 'MutationRoot';
  deleteBuyer: RowsDeleted;
  deleteCell: RowsDeleted;
  deleteCellCulturePair: RowsDeleted;
  deleteCulture: RowsDeleted;
  deleteDataGroup: RowsDeleted;
  deleteEntry: RowsDeleted;
  insertBuyer: Buyer;
  insertCell: Cell;
  insertCellCulturePair: CellCulturePair;
  insertCulture: Culture;
  insertDataGroup: DataGroup;
  insertEntry: Entry;
  updateBuyer: Buyer;
  updateCell: Cell;
  updateCellCulturePair: CellCulturePair;
  updateCulture: Culture;
  updateDataGroup: DataGroup;
  updateEntry: Entry;
};


export type MutationRootDeleteBuyerArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteCellArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteCellCulturePairArgs = {
  options: CellCulturePairDeleteOptions;
};


export type MutationRootDeleteCultureArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteDataGroupArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteEntryArgs = {
  options: DeleteOptions;
};


export type MutationRootInsertBuyerArgs = {
  options: BuyerInsertOptions;
};


export type MutationRootInsertCellArgs = {
  options: CellInsertOptions;
};


export type MutationRootInsertCellCulturePairArgs = {
  options: CellCulturePairIds;
};


export type MutationRootInsertCultureArgs = {
  options: CultureInsertOptions;
};


export type MutationRootInsertDataGroupArgs = {
  options: DataGroupInsertOptions;
};


export type MutationRootInsertEntryArgs = {
  options: EntryInsertOptions;
};


export type MutationRootUpdateBuyerArgs = {
  options: BuyerUpdateOptions;
};


export type MutationRootUpdateCellArgs = {
  options: CellUpdateOptions;
};


export type MutationRootUpdateCellCulturePairArgs = {
  options: CellCulturePairUpdateOptions;
};


export type MutationRootUpdateCultureArgs = {
  options: CultureUpdateOptions;
};


export type MutationRootUpdateDataGroupArgs = {
  options: DataGroupUpdateOptions;
};


export type MutationRootUpdateEntryArgs = {
  options: EntryUpdateOptions;
};

export enum Ordering {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type QueryRoot = {
  __typename?: 'QueryRoot';
  allCellCulturePairs: AllCellCulturePairs;
  allEntries: AllEntires;
  buyers: BuyerResult;
  cellCulturePairs: CellCulturePairResult;
  cells: CellResult;
  cultures: CultureResult;
  dataGroups: DataGroupResult;
  entries: EntryResult;
  pairedCells: CellResult;
  pairedCultures: CultureResult;
  unpairedCells: CellResult;
  unpairedCultures: CultureResult;
};


export type QueryRootAllCellCulturePairsArgs = {
  options: CellCultureFetchOptions;
};


export type QueryRootAllEntriesArgs = {
  options: EntryFetchOptions;
};


export type QueryRootBuyersArgs = {
  options: BuyerFetchOptions;
};


export type QueryRootCellCulturePairsArgs = {
  options: CellCultureFetchOptions;
};


export type QueryRootCellsArgs = {
  options: CellFetchOptions;
};


export type QueryRootCulturesArgs = {
  options: CultureFetchOptions;
};


export type QueryRootDataGroupsArgs = {
  options: DataGroupFetchOptions;
};


export type QueryRootEntriesArgs = {
  options: EntryFetchOptions;
};


export type QueryRootPairedCellsArgs = {
  options: CellParityFetchOptions;
};


export type QueryRootPairedCulturesArgs = {
  options: CultureParityFetchOptions;
};


export type QueryRootUnpairedCellsArgs = {
  options: CellParityFetchOptions;
};


export type QueryRootUnpairedCulturesArgs = {
  options: CultureParityFetchOptions;
};

export type RowsDeleted = {
  __typename?: 'RowsDeleted';
  numRows: Scalars['Int'];
};

export type GetBuyersQueryVariables = Exact<{
  options: BuyerFetchOptions;
}>;


export type GetBuyersQuery = { __typename?: 'QueryRoot', buyers: { __typename?: 'BuyerResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null }> } };

export type InsertBuyerMutationVariables = Exact<{
  options: BuyerInsertOptions;
}>;


export type InsertBuyerMutation = { __typename?: 'MutationRoot', insertBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null } };

export type UpdateBuyerMutationVariables = Exact<{
  options: BuyerUpdateOptions;
}>;


export type UpdateBuyerMutation = { __typename?: 'MutationRoot', updateBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null } };

export type DeleteBuyerMutationVariables = Exact<{
  options: DeleteOptions;
}>;


export type DeleteBuyerMutation = { __typename?: 'MutationRoot', deleteBuyer: { __typename?: 'RowsDeleted', numRows: number } };

export type BuyerPartsFragment = { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null };

export type GetCellsQueryVariables = Exact<{
  options: CellFetchOptions;
}>;


export type GetCellsQuery = { __typename?: 'QueryRoot', cells: { __typename?: 'CellResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }> } };

export type GetUnpairedCellsQueryVariables = Exact<{
  options: CellParityFetchOptions;
}>;


export type GetUnpairedCellsQuery = { __typename?: 'QueryRoot', unpairedCells: { __typename?: 'CellResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }> } };

export type GetPairedCellsQueryVariables = Exact<{
  options: CellParityFetchOptions;
}>;


export type GetPairedCellsQuery = { __typename?: 'QueryRoot', pairedCells: { __typename?: 'CellResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }> } };

export type InsertCellMutationVariables = Exact<{
  options: CellInsertOptions;
}>;


export type InsertCellMutation = { __typename?: 'MutationRoot', insertCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null } };

export type UpdateCellMutationVariables = Exact<{
  options: CellUpdateOptions;
}>;


export type UpdateCellMutation = { __typename?: 'MutationRoot', updateCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null } };

export type DeleteCellMutationVariables = Exact<{
  options: DeleteOptions;
}>;


export type DeleteCellMutation = { __typename?: 'MutationRoot', deleteCell: { __typename?: 'RowsDeleted', numRows: number } };

export type CellPartsFragment = { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null };

export type GetCellCulturesPairsQueryVariables = Exact<{
  options: CellCultureFetchOptions;
}>;


export type GetCellCulturesPairsQuery = { __typename?: 'QueryRoot', cellCulturePairs: { __typename?: 'CellCulturePairResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'CellCulturePair', createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } }> } };

export type GetAllCellCulturePairsQueryVariables = Exact<{
  options: CellCultureFetchOptions;
}>;


export type GetAllCellCulturePairsQuery = { __typename?: 'QueryRoot', allCellCulturePairs: { __typename?: 'AllCellCulturePairs', total: number, results: Array<{ __typename?: 'CellCulturePair', createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } }> } };

export type InsertCellCulturePairMutationVariables = Exact<{
  options: CellCulturePairIds;
}>;


export type InsertCellCulturePairMutation = { __typename?: 'MutationRoot', insertCellCulturePair: { __typename?: 'CellCulturePair', createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } } };

export type UpdateCellCulturePairMutationVariables = Exact<{
  options: CellCulturePairUpdateOptions;
}>;


export type UpdateCellCulturePairMutation = { __typename?: 'MutationRoot', updateCellCulturePair: { __typename?: 'CellCulturePair', createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } } };

export type DeleteCellCulturePairMutationVariables = Exact<{
  options: CellCulturePairDeleteOptions;
}>;


export type DeleteCellCulturePairMutation = { __typename?: 'MutationRoot', deleteCellCulturePair: { __typename?: 'RowsDeleted', numRows: number } };

export type DataGroupPartsFragment = { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any };

export type CulturePartsFragment = { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null };

export type CellCulturePartsFragment = { __typename?: 'CellCulturePair', createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } };

export type GetCulturesQueryVariables = Exact<{
  options: CultureFetchOptions;
}>;


export type GetCulturesQuery = { __typename?: 'QueryRoot', cultures: { __typename?: 'CultureResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }> } };

export type GetUnpairedCulturesQueryVariables = Exact<{
  options: CultureParityFetchOptions;
}>;


export type GetUnpairedCulturesQuery = { __typename?: 'QueryRoot', unpairedCultures: { __typename?: 'CultureResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }> } };

export type GetPairedCulturesQueryVariables = Exact<{
  options: CultureParityFetchOptions;
}>;


export type GetPairedCulturesQuery = { __typename?: 'QueryRoot', pairedCultures: { __typename?: 'CultureResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }> } };

export type InsertCultureMutationVariables = Exact<{
  options: CultureInsertOptions;
}>;


export type InsertCultureMutation = { __typename?: 'MutationRoot', insertCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null } };

export type UpdateCultureMutationVariables = Exact<{
  options: CultureUpdateOptions;
}>;


export type UpdateCultureMutation = { __typename?: 'MutationRoot', updateCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null } };

export type DeleteCultureMutationVariables = Exact<{
  options: DeleteOptions;
}>;


export type DeleteCultureMutation = { __typename?: 'MutationRoot', deleteCulture: { __typename?: 'RowsDeleted', numRows: number } };

export type GetDataGroupsQueryVariables = Exact<{
  options: DataGroupFetchOptions;
}>;


export type GetDataGroupsQuery = { __typename?: 'QueryRoot', dataGroups: { __typename?: 'DataGroupResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any }> } };

export type InsertDataGroupMutationVariables = Exact<{
  options: DataGroupInsertOptions;
}>;


export type InsertDataGroupMutation = { __typename?: 'MutationRoot', insertDataGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } };

export type UpdateDataGroupMutationVariables = Exact<{
  options: DataGroupUpdateOptions;
}>;


export type UpdateDataGroupMutation = { __typename?: 'MutationRoot', updateDataGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } };

export type DeleteDataGroupMutationVariables = Exact<{
  options: DeleteOptions;
}>;


export type DeleteDataGroupMutation = { __typename?: 'MutationRoot', deleteDataGroup: { __typename?: 'RowsDeleted', numRows: number } };

export type GetEntriesQueryVariables = Exact<{
  options: EntryFetchOptions;
}>;


export type GetEntriesQuery = { __typename?: 'QueryRoot', entries: { __typename?: 'EntryResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null } | null, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup?: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } | null }> } };

export type GetAllEntriesQueryVariables = Exact<{
  options: EntryFetchOptions;
}>;


export type GetAllEntriesQuery = { __typename?: 'QueryRoot', allEntries: { __typename?: 'AllEntires', total: number, results: Array<{ __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null } | null, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup?: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } | null }> } };

export type InsertEntryMutationVariables = Exact<{
  options: EntryInsertOptions;
}>;


export type InsertEntryMutation = { __typename?: 'MutationRoot', insertEntry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null } | null, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup?: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } | null } };

export type UpdateEntryMutationVariables = Exact<{
  options: EntryUpdateOptions;
}>;


export type UpdateEntryMutation = { __typename?: 'MutationRoot', updateEntry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null } | null, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup?: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } | null } };

export type DeleteEntryMutationVariables = Exact<{
  options: DeleteOptions;
}>;


export type DeleteEntryMutation = { __typename?: 'MutationRoot', deleteEntry: { __typename?: 'RowsDeleted', numRows: number } };

export type EntryPartsFragment = { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: number | null } | null, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: number | null }, dGroup?: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } | null };

export const CellPartsFragmentDoc = `
    fragment CellParts on Cell {
  id
  name
  description
  createdAt
  dGroup
}
    `;
export const CulturePartsFragmentDoc = `
    fragment CultureParts on Culture {
  id
  name
  description
  createdAt
  dGroup
}
    `;
export const DataGroupPartsFragmentDoc = `
    fragment DataGroupParts on DataGroup {
  id
  name
  description
  createdAt
}
    `;
export const CellCulturePartsFragmentDoc = `
    fragment CellCultureParts on CellCulturePair {
  cell {
    ...CellParts
  }
  culture {
    ...CultureParts
  }
  createdAt
  dGroup {
    ...DataGroupParts
  }
}
    `;
export const BuyerPartsFragmentDoc = `
    fragment BuyerParts on Buyer {
  id
  name
  address
  contact
  createdAt
  dGroup
}
    `;
export const EntryPartsFragmentDoc = `
    fragment EntryParts on Entry {
  id
  weight
  weightType
  date
  createdAt
  buyer {
    ...BuyerParts
  }
  cell {
    ...CellParts
  }
  culture {
    ...CultureParts
  }
  dGroup {
    ...DataGroupParts
  }
}
    `;
export const GetBuyersDocument = `
    query GetBuyers($options: BuyerFetchOptions!) {
  buyers(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...BuyerParts
    }
  }
}
    ${BuyerPartsFragmentDoc}`;
export const useGetBuyersQuery = <
      TData = GetBuyersQuery,
      TError = unknown
    >(
      variables: GetBuyersQueryVariables,
      options?: UseQueryOptions<GetBuyersQuery, TError, TData>
    ) =>
    useQuery<GetBuyersQuery, TError, TData>(
      ['GetBuyers', variables],
      fetcher<GetBuyersQuery, GetBuyersQueryVariables>(GetBuyersDocument, variables),
      options
    );
export const InsertBuyerDocument = `
    mutation InsertBuyer($options: BuyerInsertOptions!) {
  insertBuyer(options: $options) {
    ...BuyerParts
  }
}
    ${BuyerPartsFragmentDoc}`;
export const useInsertBuyerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertBuyerMutation, TError, InsertBuyerMutationVariables, TContext>) =>
    useMutation<InsertBuyerMutation, TError, InsertBuyerMutationVariables, TContext>(
      ['InsertBuyer'],
      (variables?: InsertBuyerMutationVariables) => fetcher<InsertBuyerMutation, InsertBuyerMutationVariables>(InsertBuyerDocument, variables)(),
      options
    );
export const UpdateBuyerDocument = `
    mutation UpdateBuyer($options: BuyerUpdateOptions!) {
  updateBuyer(options: $options) {
    ...BuyerParts
  }
}
    ${BuyerPartsFragmentDoc}`;
export const useUpdateBuyerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateBuyerMutation, TError, UpdateBuyerMutationVariables, TContext>) =>
    useMutation<UpdateBuyerMutation, TError, UpdateBuyerMutationVariables, TContext>(
      ['UpdateBuyer'],
      (variables?: UpdateBuyerMutationVariables) => fetcher<UpdateBuyerMutation, UpdateBuyerMutationVariables>(UpdateBuyerDocument, variables)(),
      options
    );
export const DeleteBuyerDocument = `
    mutation DeleteBuyer($options: DeleteOptions!) {
  deleteBuyer(options: $options) {
    numRows
  }
}
    `;
export const useDeleteBuyerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteBuyerMutation, TError, DeleteBuyerMutationVariables, TContext>) =>
    useMutation<DeleteBuyerMutation, TError, DeleteBuyerMutationVariables, TContext>(
      ['DeleteBuyer'],
      (variables?: DeleteBuyerMutationVariables) => fetcher<DeleteBuyerMutation, DeleteBuyerMutationVariables>(DeleteBuyerDocument, variables)(),
      options
    );
export const GetCellsDocument = `
    query GetCells($options: CellFetchOptions!) {
  cells(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...CellParts
    }
  }
}
    ${CellPartsFragmentDoc}`;
export const useGetCellsQuery = <
      TData = GetCellsQuery,
      TError = unknown
    >(
      variables: GetCellsQueryVariables,
      options?: UseQueryOptions<GetCellsQuery, TError, TData>
    ) =>
    useQuery<GetCellsQuery, TError, TData>(
      ['GetCells', variables],
      fetcher<GetCellsQuery, GetCellsQueryVariables>(GetCellsDocument, variables),
      options
    );
export const GetUnpairedCellsDocument = `
    query GetUnpairedCells($options: CellParityFetchOptions!) {
  unpairedCells(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...CellParts
    }
  }
}
    ${CellPartsFragmentDoc}`;
export const useGetUnpairedCellsQuery = <
      TData = GetUnpairedCellsQuery,
      TError = unknown
    >(
      variables: GetUnpairedCellsQueryVariables,
      options?: UseQueryOptions<GetUnpairedCellsQuery, TError, TData>
    ) =>
    useQuery<GetUnpairedCellsQuery, TError, TData>(
      ['GetUnpairedCells', variables],
      fetcher<GetUnpairedCellsQuery, GetUnpairedCellsQueryVariables>(GetUnpairedCellsDocument, variables),
      options
    );
export const GetPairedCellsDocument = `
    query GetPairedCells($options: CellParityFetchOptions!) {
  pairedCells(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...CellParts
    }
  }
}
    ${CellPartsFragmentDoc}`;
export const useGetPairedCellsQuery = <
      TData = GetPairedCellsQuery,
      TError = unknown
    >(
      variables: GetPairedCellsQueryVariables,
      options?: UseQueryOptions<GetPairedCellsQuery, TError, TData>
    ) =>
    useQuery<GetPairedCellsQuery, TError, TData>(
      ['GetPairedCells', variables],
      fetcher<GetPairedCellsQuery, GetPairedCellsQueryVariables>(GetPairedCellsDocument, variables),
      options
    );
export const InsertCellDocument = `
    mutation InsertCell($options: CellInsertOptions!) {
  insertCell(options: $options) {
    ...CellParts
  }
}
    ${CellPartsFragmentDoc}`;
export const useInsertCellMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCellMutation, TError, InsertCellMutationVariables, TContext>) =>
    useMutation<InsertCellMutation, TError, InsertCellMutationVariables, TContext>(
      ['InsertCell'],
      (variables?: InsertCellMutationVariables) => fetcher<InsertCellMutation, InsertCellMutationVariables>(InsertCellDocument, variables)(),
      options
    );
export const UpdateCellDocument = `
    mutation UpdateCell($options: CellUpdateOptions!) {
  updateCell(options: $options) {
    ...CellParts
  }
}
    ${CellPartsFragmentDoc}`;
export const useUpdateCellMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCellMutation, TError, UpdateCellMutationVariables, TContext>) =>
    useMutation<UpdateCellMutation, TError, UpdateCellMutationVariables, TContext>(
      ['UpdateCell'],
      (variables?: UpdateCellMutationVariables) => fetcher<UpdateCellMutation, UpdateCellMutationVariables>(UpdateCellDocument, variables)(),
      options
    );
export const DeleteCellDocument = `
    mutation DeleteCell($options: DeleteOptions!) {
  deleteCell(options: $options) {
    numRows
  }
}
    `;
export const useDeleteCellMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCellMutation, TError, DeleteCellMutationVariables, TContext>) =>
    useMutation<DeleteCellMutation, TError, DeleteCellMutationVariables, TContext>(
      ['DeleteCell'],
      (variables?: DeleteCellMutationVariables) => fetcher<DeleteCellMutation, DeleteCellMutationVariables>(DeleteCellDocument, variables)(),
      options
    );
export const GetCellCulturesPairsDocument = `
    query GetCellCulturesPairs($options: CellCultureFetchOptions!) {
  cellCulturePairs(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...CellCultureParts
    }
  }
}
    ${CellCulturePartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useGetCellCulturesPairsQuery = <
      TData = GetCellCulturesPairsQuery,
      TError = unknown
    >(
      variables: GetCellCulturesPairsQueryVariables,
      options?: UseQueryOptions<GetCellCulturesPairsQuery, TError, TData>
    ) =>
    useQuery<GetCellCulturesPairsQuery, TError, TData>(
      ['GetCellCulturesPairs', variables],
      fetcher<GetCellCulturesPairsQuery, GetCellCulturesPairsQueryVariables>(GetCellCulturesPairsDocument, variables),
      options
    );
export const GetAllCellCulturePairsDocument = `
    query GetAllCellCulturePairs($options: CellCultureFetchOptions!) {
  allCellCulturePairs(options: $options) {
    total
    results {
      ...CellCultureParts
    }
  }
}
    ${CellCulturePartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useGetAllCellCulturePairsQuery = <
      TData = GetAllCellCulturePairsQuery,
      TError = unknown
    >(
      variables: GetAllCellCulturePairsQueryVariables,
      options?: UseQueryOptions<GetAllCellCulturePairsQuery, TError, TData>
    ) =>
    useQuery<GetAllCellCulturePairsQuery, TError, TData>(
      ['GetAllCellCulturePairs', variables],
      fetcher<GetAllCellCulturePairsQuery, GetAllCellCulturePairsQueryVariables>(GetAllCellCulturePairsDocument, variables),
      options
    );
export const InsertCellCulturePairDocument = `
    mutation InsertCellCulturePair($options: CellCulturePairIds!) {
  insertCellCulturePair(options: $options) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useInsertCellCulturePairMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCellCulturePairMutation, TError, InsertCellCulturePairMutationVariables, TContext>) =>
    useMutation<InsertCellCulturePairMutation, TError, InsertCellCulturePairMutationVariables, TContext>(
      ['InsertCellCulturePair'],
      (variables?: InsertCellCulturePairMutationVariables) => fetcher<InsertCellCulturePairMutation, InsertCellCulturePairMutationVariables>(InsertCellCulturePairDocument, variables)(),
      options
    );
export const UpdateCellCulturePairDocument = `
    mutation UpdateCellCulturePair($options: CellCulturePairUpdateOptions!) {
  updateCellCulturePair(options: $options) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useUpdateCellCulturePairMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCellCulturePairMutation, TError, UpdateCellCulturePairMutationVariables, TContext>) =>
    useMutation<UpdateCellCulturePairMutation, TError, UpdateCellCulturePairMutationVariables, TContext>(
      ['UpdateCellCulturePair'],
      (variables?: UpdateCellCulturePairMutationVariables) => fetcher<UpdateCellCulturePairMutation, UpdateCellCulturePairMutationVariables>(UpdateCellCulturePairDocument, variables)(),
      options
    );
export const DeleteCellCulturePairDocument = `
    mutation DeleteCellCulturePair($options: CellCulturePairDeleteOptions!) {
  deleteCellCulturePair(options: $options) {
    numRows
  }
}
    `;
export const useDeleteCellCulturePairMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCellCulturePairMutation, TError, DeleteCellCulturePairMutationVariables, TContext>) =>
    useMutation<DeleteCellCulturePairMutation, TError, DeleteCellCulturePairMutationVariables, TContext>(
      ['DeleteCellCulturePair'],
      (variables?: DeleteCellCulturePairMutationVariables) => fetcher<DeleteCellCulturePairMutation, DeleteCellCulturePairMutationVariables>(DeleteCellCulturePairDocument, variables)(),
      options
    );
export const GetCulturesDocument = `
    query GetCultures($options: CultureFetchOptions!) {
  cultures(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...CultureParts
    }
  }
}
    ${CulturePartsFragmentDoc}`;
export const useGetCulturesQuery = <
      TData = GetCulturesQuery,
      TError = unknown
    >(
      variables: GetCulturesQueryVariables,
      options?: UseQueryOptions<GetCulturesQuery, TError, TData>
    ) =>
    useQuery<GetCulturesQuery, TError, TData>(
      ['GetCultures', variables],
      fetcher<GetCulturesQuery, GetCulturesQueryVariables>(GetCulturesDocument, variables),
      options
    );
export const GetUnpairedCulturesDocument = `
    query GetUnpairedCultures($options: CultureParityFetchOptions!) {
  unpairedCultures(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...CultureParts
    }
  }
}
    ${CulturePartsFragmentDoc}`;
export const useGetUnpairedCulturesQuery = <
      TData = GetUnpairedCulturesQuery,
      TError = unknown
    >(
      variables: GetUnpairedCulturesQueryVariables,
      options?: UseQueryOptions<GetUnpairedCulturesQuery, TError, TData>
    ) =>
    useQuery<GetUnpairedCulturesQuery, TError, TData>(
      ['GetUnpairedCultures', variables],
      fetcher<GetUnpairedCulturesQuery, GetUnpairedCulturesQueryVariables>(GetUnpairedCulturesDocument, variables),
      options
    );
export const GetPairedCulturesDocument = `
    query GetPairedCultures($options: CultureParityFetchOptions!) {
  pairedCultures(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...CultureParts
    }
  }
}
    ${CulturePartsFragmentDoc}`;
export const useGetPairedCulturesQuery = <
      TData = GetPairedCulturesQuery,
      TError = unknown
    >(
      variables: GetPairedCulturesQueryVariables,
      options?: UseQueryOptions<GetPairedCulturesQuery, TError, TData>
    ) =>
    useQuery<GetPairedCulturesQuery, TError, TData>(
      ['GetPairedCultures', variables],
      fetcher<GetPairedCulturesQuery, GetPairedCulturesQueryVariables>(GetPairedCulturesDocument, variables),
      options
    );
export const InsertCultureDocument = `
    mutation InsertCulture($options: CultureInsertOptions!) {
  insertCulture(options: $options) {
    ...CultureParts
  }
}
    ${CulturePartsFragmentDoc}`;
export const useInsertCultureMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCultureMutation, TError, InsertCultureMutationVariables, TContext>) =>
    useMutation<InsertCultureMutation, TError, InsertCultureMutationVariables, TContext>(
      ['InsertCulture'],
      (variables?: InsertCultureMutationVariables) => fetcher<InsertCultureMutation, InsertCultureMutationVariables>(InsertCultureDocument, variables)(),
      options
    );
export const UpdateCultureDocument = `
    mutation UpdateCulture($options: CultureUpdateOptions!) {
  updateCulture(options: $options) {
    ...CultureParts
  }
}
    ${CulturePartsFragmentDoc}`;
export const useUpdateCultureMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCultureMutation, TError, UpdateCultureMutationVariables, TContext>) =>
    useMutation<UpdateCultureMutation, TError, UpdateCultureMutationVariables, TContext>(
      ['UpdateCulture'],
      (variables?: UpdateCultureMutationVariables) => fetcher<UpdateCultureMutation, UpdateCultureMutationVariables>(UpdateCultureDocument, variables)(),
      options
    );
export const DeleteCultureDocument = `
    mutation DeleteCulture($options: DeleteOptions!) {
  deleteCulture(options: $options) {
    numRows
  }
}
    `;
export const useDeleteCultureMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCultureMutation, TError, DeleteCultureMutationVariables, TContext>) =>
    useMutation<DeleteCultureMutation, TError, DeleteCultureMutationVariables, TContext>(
      ['DeleteCulture'],
      (variables?: DeleteCultureMutationVariables) => fetcher<DeleteCultureMutation, DeleteCultureMutationVariables>(DeleteCultureDocument, variables)(),
      options
    );
export const GetDataGroupsDocument = `
    query GetDataGroups($options: DataGroupFetchOptions!) {
  dataGroups(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...DataGroupParts
    }
  }
}
    ${DataGroupPartsFragmentDoc}`;
export const useGetDataGroupsQuery = <
      TData = GetDataGroupsQuery,
      TError = unknown
    >(
      variables: GetDataGroupsQueryVariables,
      options?: UseQueryOptions<GetDataGroupsQuery, TError, TData>
    ) =>
    useQuery<GetDataGroupsQuery, TError, TData>(
      ['GetDataGroups', variables],
      fetcher<GetDataGroupsQuery, GetDataGroupsQueryVariables>(GetDataGroupsDocument, variables),
      options
    );
export const InsertDataGroupDocument = `
    mutation InsertDataGroup($options: DataGroupInsertOptions!) {
  insertDataGroup(options: $options) {
    ...DataGroupParts
  }
}
    ${DataGroupPartsFragmentDoc}`;
export const useInsertDataGroupMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertDataGroupMutation, TError, InsertDataGroupMutationVariables, TContext>) =>
    useMutation<InsertDataGroupMutation, TError, InsertDataGroupMutationVariables, TContext>(
      ['InsertDataGroup'],
      (variables?: InsertDataGroupMutationVariables) => fetcher<InsertDataGroupMutation, InsertDataGroupMutationVariables>(InsertDataGroupDocument, variables)(),
      options
    );
export const UpdateDataGroupDocument = `
    mutation UpdateDataGroup($options: DataGroupUpdateOptions!) {
  updateDataGroup(options: $options) {
    ...DataGroupParts
  }
}
    ${DataGroupPartsFragmentDoc}`;
export const useUpdateDataGroupMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateDataGroupMutation, TError, UpdateDataGroupMutationVariables, TContext>) =>
    useMutation<UpdateDataGroupMutation, TError, UpdateDataGroupMutationVariables, TContext>(
      ['UpdateDataGroup'],
      (variables?: UpdateDataGroupMutationVariables) => fetcher<UpdateDataGroupMutation, UpdateDataGroupMutationVariables>(UpdateDataGroupDocument, variables)(),
      options
    );
export const DeleteDataGroupDocument = `
    mutation DeleteDataGroup($options: DeleteOptions!) {
  deleteDataGroup(options: $options) {
    numRows
  }
}
    `;
export const useDeleteDataGroupMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteDataGroupMutation, TError, DeleteDataGroupMutationVariables, TContext>) =>
    useMutation<DeleteDataGroupMutation, TError, DeleteDataGroupMutationVariables, TContext>(
      ['DeleteDataGroup'],
      (variables?: DeleteDataGroupMutationVariables) => fetcher<DeleteDataGroupMutation, DeleteDataGroupMutationVariables>(DeleteDataGroupDocument, variables)(),
      options
    );
export const GetEntriesDocument = `
    query GetEntries($options: EntryFetchOptions!) {
  entries(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...EntryParts
    }
  }
}
    ${EntryPartsFragmentDoc}
${BuyerPartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useGetEntriesQuery = <
      TData = GetEntriesQuery,
      TError = unknown
    >(
      variables: GetEntriesQueryVariables,
      options?: UseQueryOptions<GetEntriesQuery, TError, TData>
    ) =>
    useQuery<GetEntriesQuery, TError, TData>(
      ['GetEntries', variables],
      fetcher<GetEntriesQuery, GetEntriesQueryVariables>(GetEntriesDocument, variables),
      options
    );
export const GetAllEntriesDocument = `
    query GetAllEntries($options: EntryFetchOptions!) {
  allEntries(options: $options) {
    total
    results {
      ...EntryParts
    }
  }
}
    ${EntryPartsFragmentDoc}
${BuyerPartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useGetAllEntriesQuery = <
      TData = GetAllEntriesQuery,
      TError = unknown
    >(
      variables: GetAllEntriesQueryVariables,
      options?: UseQueryOptions<GetAllEntriesQuery, TError, TData>
    ) =>
    useQuery<GetAllEntriesQuery, TError, TData>(
      ['GetAllEntries', variables],
      fetcher<GetAllEntriesQuery, GetAllEntriesQueryVariables>(GetAllEntriesDocument, variables),
      options
    );
export const InsertEntryDocument = `
    mutation InsertEntry($options: EntryInsertOptions!) {
  insertEntry(options: $options) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}
${BuyerPartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useInsertEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertEntryMutation, TError, InsertEntryMutationVariables, TContext>) =>
    useMutation<InsertEntryMutation, TError, InsertEntryMutationVariables, TContext>(
      ['InsertEntry'],
      (variables?: InsertEntryMutationVariables) => fetcher<InsertEntryMutation, InsertEntryMutationVariables>(InsertEntryDocument, variables)(),
      options
    );
export const UpdateEntryDocument = `
    mutation UpdateEntry($options: EntryUpdateOptions!) {
  updateEntry(options: $options) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}
${BuyerPartsFragmentDoc}
${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}
${DataGroupPartsFragmentDoc}`;
export const useUpdateEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateEntryMutation, TError, UpdateEntryMutationVariables, TContext>) =>
    useMutation<UpdateEntryMutation, TError, UpdateEntryMutationVariables, TContext>(
      ['UpdateEntry'],
      (variables?: UpdateEntryMutationVariables) => fetcher<UpdateEntryMutation, UpdateEntryMutationVariables>(UpdateEntryDocument, variables)(),
      options
    );
export const DeleteEntryDocument = `
    mutation DeleteEntry($options: DeleteOptions!) {
  deleteEntry(options: $options) {
    numRows
  }
}
    `;
export const useDeleteEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteEntryMutation, TError, DeleteEntryMutationVariables, TContext>) =>
    useMutation<DeleteEntryMutation, TError, DeleteEntryMutationVariables, TContext>(
      ['DeleteEntry'],
      (variables?: DeleteEntryMutationVariables) => fetcher<DeleteEntryMutation, DeleteEntryMutationVariables>(DeleteEntryDocument, variables)(),
      options
    );