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
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: any;
};

export type Buyer = {
  __typename?: 'Buyer';
  address?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  dGroup?: Maybe<DataGroup>;
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
};

export type BuyerFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<BuyerFilterOptions>>;
  id: OptionalId;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<BuyerOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export enum BuyerFields {
  Address = 'ADDRESS',
  Contact = 'CONTACT',
  Name = 'NAME'
}

export type BuyerFilterOptions = {
  field: BuyerFields;
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

export type BuyerUpdateOptions = {
  address?: InputMaybe<Scalars['String']>;
  contact?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type Buyers = {
  __typename?: 'Buyers';
  limit: Scalars['Int'];
  page: Scalars['Int'];
  results: Array<Buyer>;
  total: Scalars['Int'];
};

export type Cell = {
  __typename?: 'Cell';
  createdAt: Scalars['DateTime'];
  dGroup?: Maybe<DataGroup>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export enum CellCultureOrderingFields {
  CellDescription = 'CELL_DESCRIPTION',
  CellName = 'CELL_NAME',
  CultureDescription = 'CULTURE_DESCRIPTION',
  CultureName = 'CULTURE_NAME'
}

export type CellCulturePair = {
  __typename?: 'CellCulturePair';
  cell?: Maybe<Cell>;
  createdAt: Scalars['DateTime'];
  culture?: Maybe<Culture>;
  dGroup?: Maybe<DataGroup>;
};

export type CellCulturePairDeleteOptions = {
  id: CellCulturePairIds;
};

export type CellCulturePairFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CellCulturePairFilterOptions>>;
  id: OptionalCellCulturePairIds;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CellCulturePairOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export enum CellCulturePairFields {
  CellDescription = 'CELL_DESCRIPTION',
  CellName = 'CELL_NAME',
  CultureDescription = 'CULTURE_DESCRIPTION',
  CultureName = 'CULTURE_NAME'
}

export type CellCulturePairFilterOptions = {
  field: CellCulturePairFields;
  value: Scalars['String'];
};

export type CellCulturePairIds = {
  cellId: Scalars['Int'];
  cultureId: Scalars['Int'];
  dGroup: Scalars['Int'];
};

export type CellCulturePairInsertOptions = {
  dGroup: Scalars['Int'];
  idCell: Scalars['Int'];
  idCulture: Scalars['Int'];
};

export type CellCulturePairOrderingOptions = {
  order: Ordering;
  orderBy: CellCultureOrderingFields;
};

export type CellCulturePairUpdateOptions = {
  idCellNew: Scalars['Int'];
  idCellOld: Scalars['Int'];
  idCultureNew: Scalars['Int'];
  idCultureOld: Scalars['Int'];
  idDGroup: Scalars['Int'];
};

export type CellCulturePairs = {
  __typename?: 'CellCulturePairs';
  limit: Scalars['Int'];
  page: Scalars['Int'];
  results: Array<CellCulturePair>;
  total: Scalars['Int'];
};

export type CellFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CellFilterOptions>>;
  id: OptionalId;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CellOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export type CellFetchUnpairedOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CellFilterOptions>>;
  id: CellUnpairedId;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CellOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export enum CellFields {
  Description = 'DESCRIPTION',
  Name = 'NAME'
}

export type CellFilterOptions = {
  field: CellFields;
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

export type CellUnpairedId = {
  /** Id refers to a Culture Id */
  id?: InputMaybe<Scalars['Int']>;
};

export type CellUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type Cells = {
  __typename?: 'Cells';
  limit: Scalars['Int'];
  page: Scalars['Int'];
  results: Array<Cell>;
  total: Scalars['Int'];
};

export type Culture = {
  __typename?: 'Culture';
  createdAt: Scalars['DateTime'];
  dGroup?: Maybe<DataGroup>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CultureFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CultureFilterOptions>>;
  id: OptionalId;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CultureOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export type CultureFetchUnpairedOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<CultureFilterOptions>>;
  id: CultureUnpairedId;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CultureOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export enum CultureFields {
  Description = 'DESCRIPTION',
  Name = 'NAME'
}

export type CultureFilterOptions = {
  field: CultureFields;
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

export type CultureUnpairedId = {
  /** Id refers to a Cell Id */
  id?: InputMaybe<Scalars['Int']>;
};

export type CultureUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type Cultures = {
  __typename?: 'Cultures';
  limit: Scalars['Int'];
  page: Scalars['Int'];
  results: Array<Culture>;
  total: Scalars['Int'];
};

export type DataGroup = {
  __typename?: 'DataGroup';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type DataGroupInsertOptions = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type DeleteOptions = {
  id: Scalars['Int'];
};

export type Entries = {
  __typename?: 'Entries';
  limit: Scalars['Int'];
  page: Scalars['Int'];
  results: Array<Entry>;
  total: Scalars['Int'];
};

export type Entry = {
  __typename?: 'Entry';
  buyer?: Maybe<Buyer>;
  cellCulturePair?: Maybe<CellCulturePair>;
  createdAt: Scalars['DateTime'];
  dGroup?: Maybe<DataGroup>;
  date: Scalars['DateTime'];
  id: Scalars['Int'];
  weight?: Maybe<Scalars['Float']>;
  weightType?: Maybe<Scalars['String']>;
};

export type EntryFetchIdOptions = {
  idType?: InputMaybe<EntryFetchIdOptionsEnum>;
};

export type EntryFetchIdOptionsEnum = {
  cellId?: InputMaybe<OptionalId>;
  cultureId?: InputMaybe<OptionalId>;
  id?: InputMaybe<OptionalId>;
};

export type EntryFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<EntryFilterOptions>>;
  id: EntryFetchIdOptions;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<EntryOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
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
  Weight = 'WEIGHT'
}

export type EntryFilterOptions = {
  field: EntryFields;
  value: Scalars['String'];
};

export type EntryGroup = {
  __typename?: 'EntryGroup';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type EntryGroupFetchOptions = {
  dataGroupId?: InputMaybe<Scalars['Int']>;
  filters?: InputMaybe<Array<EntryGroupFilterOptionsBase>>;
  grouping: EntryGroupOptions;
  id: OptionalId;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<EntryGroupOrderingOptionsBase>;
  page?: InputMaybe<Scalars['Int']>;
};

export enum EntryGroupFields {
  Name = 'NAME'
}

export type EntryGroupFilterOptionsBase = {
  field: EntryGroupFields;
  value: Scalars['String'];
};

export enum EntryGroupOptions {
  Buyer = 'BUYER',
  Cell = 'CELL',
  Culture = 'CULTURE'
}

export type EntryGroupOrderingOptionsBase = {
  order: Ordering;
  orderBy: EntryGroupFields;
};

export type EntryGroups = {
  __typename?: 'EntryGroups';
  limit: Scalars['Int'];
  page: Scalars['Int'];
  results: Array<EntryGroup>;
  total: Scalars['Int'];
};

export type EntryInsertOptions = {
  cellCulturePair: CellCulturePairInsertOptions;
  dGroup?: InputMaybe<Scalars['Int']>;
  date: Scalars['DateTime'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
};

export enum EntryOrderingFields {
  BuyerAddress = 'BUYER_ADDRESS',
  BuyerContact = 'BUYER_CONTACT',
  BuyerName = 'BUYER_NAME',
  CellDescription = 'CELL_DESCRIPTION',
  CellName = 'CELL_NAME',
  CultureDescription = 'CULTURE_DESCRIPTION',
  CultureName = 'CULTURE_NAME',
  Date = 'DATE',
  Weight = 'WEIGHT'
}

export type EntryOrderingOptions = {
  order: Ordering;
  orderBy: EntryOrderingFields;
};

export type EntryUpdateOptions = {
  cellCulturePair?: InputMaybe<CellCulturePairInsertOptions>;
  dGroup?: InputMaybe<Scalars['Int']>;
  date?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
};

export type MutationRoot = {
  __typename?: 'MutationRoot';
  deleteBuyer: Buyer;
  deleteCell: Cell;
  deleteCellCulturePair: CellCulturePair;
  deleteCulture: Culture;
  deleteDataGroup: DataGroup;
  deleteEntry: Entry;
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
  updateEntry: Entry;
};


export type MutationRootDeleteBuyerArgs = {
  deleteOptions: DeleteOptions;
};


export type MutationRootDeleteCellArgs = {
  deleteOptions: DeleteOptions;
};


export type MutationRootDeleteCellCulturePairArgs = {
  deleteOptions: CellCulturePairDeleteOptions;
};


export type MutationRootDeleteCultureArgs = {
  deleteOptions: DeleteOptions;
};


export type MutationRootDeleteDataGroupArgs = {
  deleteOptions: DeleteOptions;
};


export type MutationRootDeleteEntryArgs = {
  deleteOptions: DeleteOptions;
};


export type MutationRootInsertBuyerArgs = {
  insertOptions: BuyerInsertOptions;
};


export type MutationRootInsertCellArgs = {
  insertOptions: CellInsertOptions;
};


export type MutationRootInsertCellCulturePairArgs = {
  insertOptions: CellCulturePairInsertOptions;
};


export type MutationRootInsertCultureArgs = {
  insertOptions: CultureInsertOptions;
};


export type MutationRootInsertDataGroupArgs = {
  insertOptions: DataGroupInsertOptions;
};


export type MutationRootInsertEntryArgs = {
  insertOptions: EntryInsertOptions;
};


export type MutationRootUpdateBuyerArgs = {
  updateOptions: BuyerUpdateOptions;
};


export type MutationRootUpdateCellArgs = {
  updateOptions: CellUpdateOptions;
};


export type MutationRootUpdateCellCulturePairArgs = {
  updateOptions: CellCulturePairUpdateOptions;
};


export type MutationRootUpdateCultureArgs = {
  updateOptions: CultureUpdateOptions;
};


export type MutationRootUpdateEntryArgs = {
  updateOptions: EntryUpdateOptions;
};

export type OptionalCellCulturePairIds = {
  cellId?: InputMaybe<Scalars['Int']>;
  cultureId?: InputMaybe<Scalars['Int']>;
  /**
   * Data group should be provided when fetching many
   * pairs as NULL is not a value that will return any results
   */
  dGroup?: InputMaybe<Scalars['Int']>;
};

export type OptionalId = {
  id?: InputMaybe<Scalars['Int']>;
};

export enum Ordering {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type QueryRoot = {
  __typename?: 'QueryRoot';
  buyer: Buyer;
  buyers: Buyers;
  cell: Cell;
  cellCulture: CellCulturePair;
  cellCulturePairs: CellCulturePairs;
  cells: Cells;
  culture: Culture;
  cultures: Cultures;
  dataGroups: Array<DataGroup>;
  entries: Entries;
  entry: Entry;
  getAllCellCulturePairs: CellCulturePairs;
  getAllEntries: Entries;
  getEntryGroups: EntryGroups;
  pairedCells: Cells;
  pairedCultures: Cultures;
  unpairedCells: Cells;
  unpairedCultures: Cultures;
};


export type QueryRootBuyerArgs = {
  fetchOptions: BuyerFetchOptions;
};


export type QueryRootBuyersArgs = {
  fetchOptions: BuyerFetchOptions;
};


export type QueryRootCellArgs = {
  fetchOptions: CellFetchOptions;
};


export type QueryRootCellCultureArgs = {
  fetchOptions: CellCulturePairFetchOptions;
};


export type QueryRootCellCulturePairsArgs = {
  fetchOptions: CellCulturePairFetchOptions;
};


export type QueryRootCellsArgs = {
  fetchOptions: CellFetchOptions;
};


export type QueryRootCultureArgs = {
  fetchOptions: CultureFetchOptions;
};


export type QueryRootCulturesArgs = {
  fetchOptions: CultureFetchOptions;
};


export type QueryRootEntriesArgs = {
  fetchOptions: EntryFetchOptions;
};


export type QueryRootEntryArgs = {
  fetchOptions: EntryFetchOptions;
};


export type QueryRootGetAllCellCulturePairsArgs = {
  fetchOptions: CellCulturePairFetchOptions;
};


export type QueryRootGetAllEntriesArgs = {
  fetchOptions: EntryFetchOptions;
};


export type QueryRootGetEntryGroupsArgs = {
  fetchOptions: EntryGroupFetchOptions;
};


export type QueryRootPairedCellsArgs = {
  fetchOptions: CellFetchUnpairedOptions;
};


export type QueryRootPairedCulturesArgs = {
  fetchOptions: CultureFetchUnpairedOptions;
};


export type QueryRootUnpairedCellsArgs = {
  fetchOptions: CellFetchUnpairedOptions;
};


export type QueryRootUnpairedCulturesArgs = {
  fetchOptions: CultureFetchUnpairedOptions;
};

export type GetBuyersQueryVariables = Exact<{
  fetchOptions: BuyerFetchOptions;
}>;


export type GetBuyersQuery = { __typename?: 'QueryRoot', buyers: { __typename?: 'Buyers', total: number, page: number, limit: number, results: Array<{ __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetBuyerQueryVariables = Exact<{
  fetchOptions: BuyerFetchOptions;
}>;


export type GetBuyerQuery = { __typename?: 'QueryRoot', buyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type InsertBuyerMutationVariables = Exact<{
  insertOptions: BuyerInsertOptions;
}>;


export type InsertBuyerMutation = { __typename?: 'MutationRoot', insertBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type UpdateBuyerMutationVariables = Exact<{
  updateOptions: BuyerUpdateOptions;
}>;


export type UpdateBuyerMutation = { __typename?: 'MutationRoot', updateBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type DeleteBuyerMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteBuyerMutation = { __typename?: 'MutationRoot', deleteBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type BuyerPartsFragment = { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null };

export type GetCellsQueryVariables = Exact<{
  fetchOptions: CellFetchOptions;
}>;


export type GetCellsQuery = { __typename?: 'QueryRoot', cells: { __typename?: 'Cells', total: number, page: number, limit: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetCellQueryVariables = Exact<{
  fetchOptions: CellFetchOptions;
}>;


export type GetCellQuery = { __typename?: 'QueryRoot', cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type GetUnpairedCellsQueryVariables = Exact<{
  fetchOptions: CellFetchUnpairedOptions;
}>;


export type GetUnpairedCellsQuery = { __typename?: 'QueryRoot', unpairedCells: { __typename?: 'Cells', total: number, page: number, limit: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetPairedCellsQueryVariables = Exact<{
  fetchOptions: CellFetchUnpairedOptions;
}>;


export type GetPairedCellsQuery = { __typename?: 'QueryRoot', pairedCells: { __typename?: 'Cells', total: number, page: number, limit: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type InsertCellMutationVariables = Exact<{
  insertOptions: CellInsertOptions;
}>;


export type InsertCellMutation = { __typename?: 'MutationRoot', insertCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type UpdateCellMutationVariables = Exact<{
  updateOptions: CellUpdateOptions;
}>;


export type UpdateCellMutation = { __typename?: 'MutationRoot', updateCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type DeleteCellMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteCellMutation = { __typename?: 'MutationRoot', deleteCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type CellPartsFragment = { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null };

export type GetCellCulturesPairsQueryVariables = Exact<{
  fetchOptions: CellCulturePairFetchOptions;
}>;


export type GetCellCulturesPairsQuery = { __typename?: 'QueryRoot', cellCulturePairs: { __typename?: 'CellCulturePairs', total: number, page: number, limit: number, results: Array<{ __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetAllCellCultureParisQueryVariables = Exact<{
  fetchOptions: CellCulturePairFetchOptions;
}>;


export type GetAllCellCultureParisQuery = { __typename?: 'QueryRoot', getAllCellCulturePairs: { __typename?: 'CellCulturePairs', total: number, results: Array<{ __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetCellCulturePairQueryVariables = Exact<{
  fetchOptions: CellCulturePairFetchOptions;
}>;


export type GetCellCulturePairQuery = { __typename?: 'QueryRoot', cellCulture: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type InsertCellCulturePairMutationVariables = Exact<{
  insertOptions: CellCulturePairInsertOptions;
}>;


export type InsertCellCulturePairMutation = { __typename?: 'MutationRoot', insertCellCulturePair: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type UpdateCellCulturePairMutationVariables = Exact<{
  updateOptions: CellCulturePairUpdateOptions;
}>;


export type UpdateCellCulturePairMutation = { __typename?: 'MutationRoot', updateCellCulturePair: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type DeleteCellCulturePairMutationVariables = Exact<{
  deleteOptions: CellCulturePairDeleteOptions;
}>;


export type DeleteCellCulturePairMutation = { __typename?: 'MutationRoot', deleteCellCulturePair: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type CellCulturePartsFragment = { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null };

export type GetCulturesQueryVariables = Exact<{
  fetchOptions: CultureFetchOptions;
}>;


export type GetCulturesQuery = { __typename?: 'QueryRoot', cultures: { __typename?: 'Cultures', total: number, page: number, limit: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetCultureQueryVariables = Exact<{
  fetchOptions: CultureFetchOptions;
}>;


export type GetCultureQuery = { __typename?: 'QueryRoot', culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type GetUnpairedCulturesQueryVariables = Exact<{
  fetchOptions: CultureFetchUnpairedOptions;
}>;


export type GetUnpairedCulturesQuery = { __typename?: 'QueryRoot', unpairedCultures: { __typename?: 'Cultures', total: number, page: number, limit: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetPairedCulturesQueryVariables = Exact<{
  fetchOptions: CultureFetchUnpairedOptions;
}>;


export type GetPairedCulturesQuery = { __typename?: 'QueryRoot', pairedCultures: { __typename?: 'Cultures', total: number, page: number, limit: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type InsertCultureMutationVariables = Exact<{
  insertOptions: CultureInsertOptions;
}>;


export type InsertCultureMutation = { __typename?: 'MutationRoot', insertCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type UpdateCultureMutationVariables = Exact<{
  updateOptions: CultureUpdateOptions;
}>;


export type UpdateCultureMutation = { __typename?: 'MutationRoot', updateCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type DeleteCultureMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteCultureMutation = { __typename?: 'MutationRoot', deleteCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type CulturePartsFragment = { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null };

export type GetDataGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDataGroupsQuery = { __typename?: 'QueryRoot', dataGroups: Array<{ __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any }> };

export type InsertDataGroupMutationVariables = Exact<{
  insertOptions: DataGroupInsertOptions;
}>;


export type InsertDataGroupMutation = { __typename?: 'MutationRoot', insertDataGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } };

export type DeleteDataGroupMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteDataGroupMutation = { __typename?: 'MutationRoot', deleteDataGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } };

export type DataGroupPartsFragment = { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any };

export type GetEntriesQueryVariables = Exact<{
  fetchOptions: EntryFetchOptions;
}>;


export type GetEntriesQuery = { __typename?: 'QueryRoot', entries: { __typename?: 'Entries', total: number, page: number, limit: number, results: Array<{ __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetAllEntriesQueryVariables = Exact<{
  fetchOptions: EntryFetchOptions;
}>;


export type GetAllEntriesQuery = { __typename?: 'QueryRoot', getAllEntries: { __typename?: 'Entries', total: number, results: Array<{ __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null }> } };

export type GetEntryQueryVariables = Exact<{
  fetchOptions: EntryFetchOptions;
}>;


export type GetEntryQuery = { __typename?: 'QueryRoot', entry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type GetEntryGroupsQueryVariables = Exact<{
  fetchOptions: EntryGroupFetchOptions;
}>;


export type GetEntryGroupsQuery = { __typename?: 'QueryRoot', getEntryGroups: { __typename?: 'EntryGroups', total: number, page: number, limit: number, results: Array<{ __typename?: 'EntryGroup', id: number, name: string }> } };

export type InsertEntryMutationVariables = Exact<{
  insertOptions: EntryInsertOptions;
}>;


export type InsertEntryMutation = { __typename?: 'MutationRoot', insertEntry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type UpdateEntryMutationVariables = Exact<{
  updateOptions: EntryUpdateOptions;
}>;


export type UpdateEntryMutation = { __typename?: 'MutationRoot', updateEntry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type DeleteEntryMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteEntryMutation = { __typename?: 'MutationRoot', deleteEntry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } };

export type EntryPartsFragment = { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null } | null, dGroup?: { __typename?: 'DataGroup', id: number } | null };

export const DataGroupPartsFragmentDoc = `
    fragment DataGroupParts on DataGroup {
  id
  name
  description
  createdAt
}
    `;
export const BuyerPartsFragmentDoc = `
    fragment BuyerParts on Buyer {
  id
  name
  address
  contact
  createdAt
  dGroup {
    id
  }
}
    `;
export const CellPartsFragmentDoc = `
    fragment CellParts on Cell {
  id
  name
  description
  createdAt
  dGroup {
    id
  }
}
    `;
export const CulturePartsFragmentDoc = `
    fragment CultureParts on Culture {
  id
  name
  description
  createdAt
  dGroup {
    id
  }
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
    id
  }
}
    ${CellPartsFragmentDoc}
${CulturePartsFragmentDoc}`;
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
  cellCulturePair {
    ...CellCultureParts
  }
  dGroup {
    id
  }
}
    ${BuyerPartsFragmentDoc}
${CellCulturePartsFragmentDoc}`;
export const GetBuyersDocument = `
    query GetBuyers($fetchOptions: BuyerFetchOptions!) {
  buyers(fetchOptions: $fetchOptions) {
    total
    page
    limit
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
export const GetBuyerDocument = `
    query GetBuyer($fetchOptions: BuyerFetchOptions!) {
  buyer(fetchOptions: $fetchOptions) {
    ...BuyerParts
  }
}
    ${BuyerPartsFragmentDoc}`;
export const useGetBuyerQuery = <
      TData = GetBuyerQuery,
      TError = unknown
    >(
      variables: GetBuyerQueryVariables,
      options?: UseQueryOptions<GetBuyerQuery, TError, TData>
    ) =>
    useQuery<GetBuyerQuery, TError, TData>(
      ['GetBuyer', variables],
      fetcher<GetBuyerQuery, GetBuyerQueryVariables>(GetBuyerDocument, variables),
      options
    );
export const InsertBuyerDocument = `
    mutation InsertBuyer($insertOptions: BuyerInsertOptions!) {
  insertBuyer(insertOptions: $insertOptions) {
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
    mutation UpdateBuyer($updateOptions: BuyerUpdateOptions!) {
  updateBuyer(updateOptions: $updateOptions) {
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
    mutation DeleteBuyer($deleteOptions: DeleteOptions!) {
  deleteBuyer(deleteOptions: $deleteOptions) {
    ...BuyerParts
  }
}
    ${BuyerPartsFragmentDoc}`;
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
    query GetCells($fetchOptions: CellFetchOptions!) {
  cells(fetchOptions: $fetchOptions) {
    total
    page
    limit
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
export const GetCellDocument = `
    query GetCell($fetchOptions: CellFetchOptions!) {
  cell(fetchOptions: $fetchOptions) {
    ...CellParts
  }
}
    ${CellPartsFragmentDoc}`;
export const useGetCellQuery = <
      TData = GetCellQuery,
      TError = unknown
    >(
      variables: GetCellQueryVariables,
      options?: UseQueryOptions<GetCellQuery, TError, TData>
    ) =>
    useQuery<GetCellQuery, TError, TData>(
      ['GetCell', variables],
      fetcher<GetCellQuery, GetCellQueryVariables>(GetCellDocument, variables),
      options
    );
export const GetUnpairedCellsDocument = `
    query GetUnpairedCells($fetchOptions: CellFetchUnpairedOptions!) {
  unpairedCells(fetchOptions: $fetchOptions) {
    total
    page
    limit
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
    query GetPairedCells($fetchOptions: CellFetchUnpairedOptions!) {
  pairedCells(fetchOptions: $fetchOptions) {
    total
    page
    limit
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
    mutation InsertCell($insertOptions: CellInsertOptions!) {
  insertCell(insertOptions: $insertOptions) {
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
    mutation UpdateCell($updateOptions: CellUpdateOptions!) {
  updateCell(updateOptions: $updateOptions) {
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
    mutation DeleteCell($deleteOptions: DeleteOptions!) {
  deleteCell(deleteOptions: $deleteOptions) {
    ...CellParts
  }
}
    ${CellPartsFragmentDoc}`;
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
    query GetCellCulturesPairs($fetchOptions: CellCulturePairFetchOptions!) {
  cellCulturePairs(fetchOptions: $fetchOptions) {
    total
    page
    limit
    results {
      ...CellCultureParts
    }
  }
}
    ${CellCulturePartsFragmentDoc}`;
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
export const GetAllCellCultureParisDocument = `
    query GetAllCellCultureParis($fetchOptions: CellCulturePairFetchOptions!) {
  getAllCellCulturePairs(fetchOptions: $fetchOptions) {
    total
    results {
      ...CellCultureParts
    }
  }
}
    ${CellCulturePartsFragmentDoc}`;
export const useGetAllCellCultureParisQuery = <
      TData = GetAllCellCultureParisQuery,
      TError = unknown
    >(
      variables: GetAllCellCultureParisQueryVariables,
      options?: UseQueryOptions<GetAllCellCultureParisQuery, TError, TData>
    ) =>
    useQuery<GetAllCellCultureParisQuery, TError, TData>(
      ['GetAllCellCultureParis', variables],
      fetcher<GetAllCellCultureParisQuery, GetAllCellCultureParisQueryVariables>(GetAllCellCultureParisDocument, variables),
      options
    );
export const GetCellCulturePairDocument = `
    query GetCellCulturePair($fetchOptions: CellCulturePairFetchOptions!) {
  cellCulture(fetchOptions: $fetchOptions) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}`;
export const useGetCellCulturePairQuery = <
      TData = GetCellCulturePairQuery,
      TError = unknown
    >(
      variables: GetCellCulturePairQueryVariables,
      options?: UseQueryOptions<GetCellCulturePairQuery, TError, TData>
    ) =>
    useQuery<GetCellCulturePairQuery, TError, TData>(
      ['GetCellCulturePair', variables],
      fetcher<GetCellCulturePairQuery, GetCellCulturePairQueryVariables>(GetCellCulturePairDocument, variables),
      options
    );
export const InsertCellCulturePairDocument = `
    mutation InsertCellCulturePair($insertOptions: CellCulturePairInsertOptions!) {
  insertCellCulturePair(insertOptions: $insertOptions) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}`;
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
    mutation UpdateCellCulturePair($updateOptions: CellCulturePairUpdateOptions!) {
  updateCellCulturePair(updateOptions: $updateOptions) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}`;
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
    mutation DeleteCellCulturePair($deleteOptions: CellCulturePairDeleteOptions!) {
  deleteCellCulturePair(deleteOptions: $deleteOptions) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}`;
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
    query GetCultures($fetchOptions: CultureFetchOptions!) {
  cultures(fetchOptions: $fetchOptions) {
    total
    page
    limit
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
export const GetCultureDocument = `
    query GetCulture($fetchOptions: CultureFetchOptions!) {
  culture(fetchOptions: $fetchOptions) {
    ...CultureParts
  }
}
    ${CulturePartsFragmentDoc}`;
export const useGetCultureQuery = <
      TData = GetCultureQuery,
      TError = unknown
    >(
      variables: GetCultureQueryVariables,
      options?: UseQueryOptions<GetCultureQuery, TError, TData>
    ) =>
    useQuery<GetCultureQuery, TError, TData>(
      ['GetCulture', variables],
      fetcher<GetCultureQuery, GetCultureQueryVariables>(GetCultureDocument, variables),
      options
    );
export const GetUnpairedCulturesDocument = `
    query GetUnpairedCultures($fetchOptions: CultureFetchUnpairedOptions!) {
  unpairedCultures(fetchOptions: $fetchOptions) {
    total
    page
    limit
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
    query GetPairedCultures($fetchOptions: CultureFetchUnpairedOptions!) {
  pairedCultures(fetchOptions: $fetchOptions) {
    total
    page
    limit
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
    mutation InsertCulture($insertOptions: CultureInsertOptions!) {
  insertCulture(insertOptions: $insertOptions) {
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
    mutation UpdateCulture($updateOptions: CultureUpdateOptions!) {
  updateCulture(updateOptions: $updateOptions) {
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
    mutation DeleteCulture($deleteOptions: DeleteOptions!) {
  deleteCulture(deleteOptions: $deleteOptions) {
    ...CultureParts
  }
}
    ${CulturePartsFragmentDoc}`;
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
    query GetDataGroups {
  dataGroups {
    ...DataGroupParts
  }
}
    ${DataGroupPartsFragmentDoc}`;
export const useGetDataGroupsQuery = <
      TData = GetDataGroupsQuery,
      TError = unknown
    >(
      variables?: GetDataGroupsQueryVariables,
      options?: UseQueryOptions<GetDataGroupsQuery, TError, TData>
    ) =>
    useQuery<GetDataGroupsQuery, TError, TData>(
      variables === undefined ? ['GetDataGroups'] : ['GetDataGroups', variables],
      fetcher<GetDataGroupsQuery, GetDataGroupsQueryVariables>(GetDataGroupsDocument, variables),
      options
    );
export const InsertDataGroupDocument = `
    mutation InsertDataGroup($insertOptions: DataGroupInsertOptions!) {
  insertDataGroup(insertOptions: $insertOptions) {
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
export const DeleteDataGroupDocument = `
    mutation DeleteDataGroup($deleteOptions: DeleteOptions!) {
  deleteDataGroup(deleteOptions: $deleteOptions) {
    ...DataGroupParts
  }
}
    ${DataGroupPartsFragmentDoc}`;
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
    query GetEntries($fetchOptions: EntryFetchOptions!) {
  entries(fetchOptions: $fetchOptions) {
    total
    page
    limit
    results {
      ...EntryParts
    }
  }
}
    ${EntryPartsFragmentDoc}`;
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
    query GetAllEntries($fetchOptions: EntryFetchOptions!) {
  getAllEntries(fetchOptions: $fetchOptions) {
    total
    results {
      ...EntryParts
    }
  }
}
    ${EntryPartsFragmentDoc}`;
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
export const GetEntryDocument = `
    query GetEntry($fetchOptions: EntryFetchOptions!) {
  entry(fetchOptions: $fetchOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}`;
export const useGetEntryQuery = <
      TData = GetEntryQuery,
      TError = unknown
    >(
      variables: GetEntryQueryVariables,
      options?: UseQueryOptions<GetEntryQuery, TError, TData>
    ) =>
    useQuery<GetEntryQuery, TError, TData>(
      ['GetEntry', variables],
      fetcher<GetEntryQuery, GetEntryQueryVariables>(GetEntryDocument, variables),
      options
    );
export const GetEntryGroupsDocument = `
    query GetEntryGroups($fetchOptions: EntryGroupFetchOptions!) {
  getEntryGroups(fetchOptions: $fetchOptions) {
    total
    page
    limit
    results {
      id
      name
    }
  }
}
    `;
export const useGetEntryGroupsQuery = <
      TData = GetEntryGroupsQuery,
      TError = unknown
    >(
      variables: GetEntryGroupsQueryVariables,
      options?: UseQueryOptions<GetEntryGroupsQuery, TError, TData>
    ) =>
    useQuery<GetEntryGroupsQuery, TError, TData>(
      ['GetEntryGroups', variables],
      fetcher<GetEntryGroupsQuery, GetEntryGroupsQueryVariables>(GetEntryGroupsDocument, variables),
      options
    );
export const InsertEntryDocument = `
    mutation InsertEntry($insertOptions: EntryInsertOptions!) {
  insertEntry(insertOptions: $insertOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}`;
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
    mutation UpdateEntry($updateOptions: EntryUpdateOptions!) {
  updateEntry(updateOptions: $updateOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}`;
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
    mutation DeleteEntry($deleteOptions: DeleteOptions!) {
  deleteEntry(deleteOptions: $deleteOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}`;
export const useDeleteEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteEntryMutation, TError, DeleteEntryMutationVariables, TContext>) =>
    useMutation<DeleteEntryMutation, TError, DeleteEntryMutationVariables, TContext>(
      ['DeleteEntry'],
      (variables?: DeleteEntryMutationVariables) => fetcher<DeleteEntryMutation, DeleteEntryMutationVariables>(DeleteEntryDocument, variables)(),
      options
    );