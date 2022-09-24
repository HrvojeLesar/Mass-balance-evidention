import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(endpoint: string, requestInit: RequestInit, query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...requestInit,
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
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
};

export type BuyerFetchOptions = {
  filters?: InputMaybe<Array<BuyerFilterOptions>>;
  id: Id;
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
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CellCulturePair = {
  __typename?: 'CellCulturePair';
  cell?: Maybe<Cell>;
  createdAt: Scalars['DateTime'];
  culture?: Maybe<Culture>;
};

export type CellCulturePairFetchOptions = {
  filters?: InputMaybe<Array<CellCulturePairFilterOptions>>;
  id: CellCulturePairIds;
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
  cellId?: InputMaybe<Scalars['Int']>;
  cultureId?: InputMaybe<Scalars['Int']>;
};

export type CellCulturePairInsertOptions = {
  idCell: Scalars['Int'];
  idCulture: Scalars['Int'];
};

export type CellCulturePairOrderingOptions = {
  order: Ordering;
  orderBy: CellCulturePairFields;
};

export type CellCulturePairUpdateOptions = {
  idCellNew: Scalars['Int'];
  idCellOld: Scalars['Int'];
  idCultureNew: Scalars['Int'];
  idCultureOld: Scalars['Int'];
};

export type CellCulturePairs = {
  __typename?: 'CellCulturePairs';
  limit: Scalars['Int'];
  page: Scalars['Int'];
  results: Array<CellCulturePair>;
  total: Scalars['Int'];
};

export type CellFetchOptions = {
  filters?: InputMaybe<Array<CellFilterOptions>>;
  id: Id;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CellOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export type CellFetchUnpairedOptions = {
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
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CultureFetchOptions = {
  filters?: InputMaybe<Array<CultureFilterOptions>>;
  id: Id;
  limit?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<CultureOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
};

export type CultureFetchUnpairedOptions = {
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
  date: Scalars['DateTime'];
  id: Scalars['Int'];
  weight?: Maybe<Scalars['Float']>;
  weightType?: Maybe<Scalars['String']>;
};

export type EntryFetchOptions = {
  filters?: InputMaybe<Array<EntryFilterOptions>>;
  id: Id;
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

export type EntryInsertOptions = {
  cellCulturePair: CellCulturePairInsertOptions;
  date: Scalars['DateTime'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
};

export type EntryOrderingOptions = {
  order: Ordering;
  orderBy: EntryFields;
};

export type EntryUpdateOptions = {
  cellCulturePair?: InputMaybe<CellCulturePairInsertOptions>;
  date?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
};

export type Id = {
  id?: InputMaybe<Scalars['Int']>;
};

export type MutationRoot = {
  __typename?: 'MutationRoot';
  insertBuyer: Buyer;
  insertCell: Cell;
  insertCellCulturePair: CellCulturePair;
  insertCulture: Culture;
  insertEntry: Entry;
  updateBuyer: Buyer;
  updateCell: Cell;
  updateCellCulturePair: CellCulturePair;
  updateCulture: Culture;
  updateEntry: Entry;
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
  entries: Entries;
  entry: Entry;
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


export type QueryRootUnpairedCellsArgs = {
  fetchOptions: CellFetchUnpairedOptions;
};


export type QueryRootUnpairedCulturesArgs = {
  fetchOptions: CultureFetchUnpairedOptions;
};

export type GetBuyersQueryVariables = Exact<{
  fetchOptions: BuyerFetchOptions;
}>;


export type GetBuyersQuery = { __typename?: 'QueryRoot', buyers: { __typename?: 'Buyers', total: number, page: number, limit: number, results: Array<{ __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any }> } };

export type GetBuyerQueryVariables = Exact<{
  fetchOptions: BuyerFetchOptions;
}>;


export type GetBuyerQuery = { __typename?: 'QueryRoot', buyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } };

export type InsertBuyerMutationVariables = Exact<{
  insertOptions: BuyerInsertOptions;
}>;


export type InsertBuyerMutation = { __typename?: 'MutationRoot', insertBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } };

export type UpdateBuyerMutationVariables = Exact<{
  updateOptions: BuyerUpdateOptions;
}>;


export type UpdateBuyerMutation = { __typename?: 'MutationRoot', updateBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } };

export type BuyerPartsFragment = { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any };

export type GetCellsQueryVariables = Exact<{
  fetchOptions: CellFetchOptions;
}>;


export type GetCellsQuery = { __typename?: 'QueryRoot', cells: { __typename?: 'Cells', total: number, page: number, limit: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any }> } };

export type GetCellQueryVariables = Exact<{
  fetchOptions: CellFetchOptions;
}>;


export type GetCellQuery = { __typename?: 'QueryRoot', cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } };

export type GetUnpairedCellsQueryVariables = Exact<{
  fetchOptions: CellFetchUnpairedOptions;
}>;


export type GetUnpairedCellsQuery = { __typename?: 'QueryRoot', unpairedCells: { __typename?: 'Cells', total: number, page: number, limit: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any }> } };

export type InsertCellMutationVariables = Exact<{
  insertOptions: CellInsertOptions;
}>;


export type InsertCellMutation = { __typename?: 'MutationRoot', insertCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } };

export type UpdateCellMutationVariables = Exact<{
  updateOptions: CellUpdateOptions;
}>;


export type UpdateCellMutation = { __typename?: 'MutationRoot', updateCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } };

export type CellPartsFragment = { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any };

export type GetCellCulturesPairsQueryVariables = Exact<{
  fetchOptions: CellCulturePairFetchOptions;
}>;


export type GetCellCulturesPairsQuery = { __typename?: 'QueryRoot', cellCulturePairs: { __typename?: 'CellCulturePairs', total: number, page: number, limit: number, results: Array<{ __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null }> } };

export type GetCellCulturePairQueryVariables = Exact<{
  fetchOptions: CellCulturePairFetchOptions;
}>;


export type GetCellCulturePairQuery = { __typename?: 'QueryRoot', cellCulture: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } };

export type InsertCellCulturePairMutationVariables = Exact<{
  insertOptions: CellCulturePairInsertOptions;
}>;


export type InsertCellCulturePairMutation = { __typename?: 'MutationRoot', insertCellCulturePair: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } };

export type UpdateCellCulturePairMutationVariables = Exact<{
  updateOptions: CellCulturePairUpdateOptions;
}>;


export type UpdateCellCulturePairMutation = { __typename?: 'MutationRoot', updateCellCulturePair: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } };

export type CellCulturePartsFragment = { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null };

export type GetCulturesQueryVariables = Exact<{
  fetchOptions: CultureFetchOptions;
}>;


export type GetCulturesQuery = { __typename?: 'QueryRoot', cultures: { __typename?: 'Cultures', total: number, page: number, limit: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any }> } };

export type GetCultureQueryVariables = Exact<{
  fetchOptions: CultureFetchOptions;
}>;


export type GetCultureQuery = { __typename?: 'QueryRoot', culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } };

export type GetUnpairedCulturesQueryVariables = Exact<{
  fetchOptions: CultureFetchUnpairedOptions;
}>;


export type GetUnpairedCulturesQuery = { __typename?: 'QueryRoot', unpairedCultures: { __typename?: 'Cultures', total: number, page: number, limit: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any }> } };

export type InsertCultureMutationVariables = Exact<{
  insertOptions: CultureInsertOptions;
}>;


export type InsertCultureMutation = { __typename?: 'MutationRoot', insertCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } };

export type UpdateCultureMutationVariables = Exact<{
  updateOptions: CultureUpdateOptions;
}>;


export type UpdateCultureMutation = { __typename?: 'MutationRoot', updateCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } };

export type CulturePartsFragment = { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any };

export type GetEntriesQueryVariables = Exact<{
  fetchOptions: EntryFetchOptions;
}>;


export type GetEntriesQuery = { __typename?: 'QueryRoot', entries: { __typename?: 'Entries', total: number, page: number, limit: number, results: Array<{ __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } | null }> } };

export type GetEntryQueryVariables = Exact<{
  fetchOptions: EntryFetchOptions;
}>;


export type GetEntryQuery = { __typename?: 'QueryRoot', entry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } | null } };

export type InsertEntryMutationVariables = Exact<{
  insertOptions: EntryInsertOptions;
}>;


export type InsertEntryMutation = { __typename?: 'MutationRoot', insertEntry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } | null } };

export type UpdateEntryMutationVariables = Exact<{
  updateOptions: EntryUpdateOptions;
}>;


export type UpdateEntryMutation = { __typename?: 'MutationRoot', updateEntry: { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } | null } };

export type EntryPartsFragment = { __typename?: 'Entry', id: number, weight?: number | null, weightType?: string | null, date: any, createdAt: any, buyer?: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any } | null, cellCulturePair?: { __typename?: 'CellCulturePair', createdAt: any, cell?: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } | null, culture?: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any } | null } | null };

export const BuyerPartsFragmentDoc = `
    fragment BuyerParts on Buyer {
  id
  name
  address
  contact
  createdAt
}
    `;
export const CellPartsFragmentDoc = `
    fragment CellParts on Cell {
  id
  name
  description
  createdAt
}
    `;
export const CulturePartsFragmentDoc = `
    fragment CultureParts on Culture {
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
}
    ${BuyerPartsFragmentDoc}
${CellCulturePartsFragmentDoc}`;
export const GetBuyersDocument = `
    query getBuyers($fetchOptions: BuyerFetchOptions!) {
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
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetBuyersQueryVariables,
      options?: UseQueryOptions<GetBuyersQuery, TError, TData>
    ) =>
    useQuery<GetBuyersQuery, TError, TData>(
      ['getBuyers', variables],
      fetcher<GetBuyersQuery, GetBuyersQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetBuyersDocument, variables),
      options
    );
export const GetBuyerDocument = `
    query getBuyer($fetchOptions: BuyerFetchOptions!) {
  buyer(fetchOptions: $fetchOptions) {
    ...BuyerParts
  }
}
    ${BuyerPartsFragmentDoc}`;
export const useGetBuyerQuery = <
      TData = GetBuyerQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetBuyerQueryVariables,
      options?: UseQueryOptions<GetBuyerQuery, TError, TData>
    ) =>
    useQuery<GetBuyerQuery, TError, TData>(
      ['getBuyer', variables],
      fetcher<GetBuyerQuery, GetBuyerQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetBuyerDocument, variables),
      options
    );
export const InsertBuyerDocument = `
    mutation insertBuyer($insertOptions: BuyerInsertOptions!) {
  insertBuyer(insertOptions: $insertOptions) {
    ...BuyerParts
  }
}
    ${BuyerPartsFragmentDoc}`;
export const useInsertBuyerMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<InsertBuyerMutation, TError, InsertBuyerMutationVariables, TContext>
    ) =>
    useMutation<InsertBuyerMutation, TError, InsertBuyerMutationVariables, TContext>(
      ['insertBuyer'],
      (variables?: InsertBuyerMutationVariables) => fetcher<InsertBuyerMutation, InsertBuyerMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, InsertBuyerDocument, variables)(),
      options
    );
export const UpdateBuyerDocument = `
    mutation updateBuyer($updateOptions: BuyerUpdateOptions!) {
  updateBuyer(updateOptions: $updateOptions) {
    ...BuyerParts
  }
}
    ${BuyerPartsFragmentDoc}`;
export const useUpdateBuyerMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<UpdateBuyerMutation, TError, UpdateBuyerMutationVariables, TContext>
    ) =>
    useMutation<UpdateBuyerMutation, TError, UpdateBuyerMutationVariables, TContext>(
      ['updateBuyer'],
      (variables?: UpdateBuyerMutationVariables) => fetcher<UpdateBuyerMutation, UpdateBuyerMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, UpdateBuyerDocument, variables)(),
      options
    );
export const GetCellsDocument = `
    query getCells($fetchOptions: CellFetchOptions!) {
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
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetCellsQueryVariables,
      options?: UseQueryOptions<GetCellsQuery, TError, TData>
    ) =>
    useQuery<GetCellsQuery, TError, TData>(
      ['getCells', variables],
      fetcher<GetCellsQuery, GetCellsQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetCellsDocument, variables),
      options
    );
export const GetCellDocument = `
    query getCell($fetchOptions: CellFetchOptions!) {
  cell(fetchOptions: $fetchOptions) {
    ...CellParts
  }
}
    ${CellPartsFragmentDoc}`;
export const useGetCellQuery = <
      TData = GetCellQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetCellQueryVariables,
      options?: UseQueryOptions<GetCellQuery, TError, TData>
    ) =>
    useQuery<GetCellQuery, TError, TData>(
      ['getCell', variables],
      fetcher<GetCellQuery, GetCellQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetCellDocument, variables),
      options
    );
export const GetUnpairedCellsDocument = `
    query getUnpairedCells($fetchOptions: CellFetchUnpairedOptions!) {
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
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetUnpairedCellsQueryVariables,
      options?: UseQueryOptions<GetUnpairedCellsQuery, TError, TData>
    ) =>
    useQuery<GetUnpairedCellsQuery, TError, TData>(
      ['getUnpairedCells', variables],
      fetcher<GetUnpairedCellsQuery, GetUnpairedCellsQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetUnpairedCellsDocument, variables),
      options
    );
export const InsertCellDocument = `
    mutation insertCell($insertOptions: CellInsertOptions!) {
  insertCell(insertOptions: $insertOptions) {
    ...CellParts
  }
}
    ${CellPartsFragmentDoc}`;
export const useInsertCellMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<InsertCellMutation, TError, InsertCellMutationVariables, TContext>
    ) =>
    useMutation<InsertCellMutation, TError, InsertCellMutationVariables, TContext>(
      ['insertCell'],
      (variables?: InsertCellMutationVariables) => fetcher<InsertCellMutation, InsertCellMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, InsertCellDocument, variables)(),
      options
    );
export const UpdateCellDocument = `
    mutation updateCell($updateOptions: CellUpdateOptions!) {
  updateCell(updateOptions: $updateOptions) {
    ...CellParts
  }
}
    ${CellPartsFragmentDoc}`;
export const useUpdateCellMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<UpdateCellMutation, TError, UpdateCellMutationVariables, TContext>
    ) =>
    useMutation<UpdateCellMutation, TError, UpdateCellMutationVariables, TContext>(
      ['updateCell'],
      (variables?: UpdateCellMutationVariables) => fetcher<UpdateCellMutation, UpdateCellMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, UpdateCellDocument, variables)(),
      options
    );
export const GetCellCulturesPairsDocument = `
    query getCellCulturesPairs($fetchOptions: CellCulturePairFetchOptions!) {
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
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetCellCulturesPairsQueryVariables,
      options?: UseQueryOptions<GetCellCulturesPairsQuery, TError, TData>
    ) =>
    useQuery<GetCellCulturesPairsQuery, TError, TData>(
      ['getCellCulturesPairs', variables],
      fetcher<GetCellCulturesPairsQuery, GetCellCulturesPairsQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetCellCulturesPairsDocument, variables),
      options
    );
export const GetCellCulturePairDocument = `
    query getCellCulturePair($fetchOptions: CellCulturePairFetchOptions!) {
  cellCulture(fetchOptions: $fetchOptions) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}`;
export const useGetCellCulturePairQuery = <
      TData = GetCellCulturePairQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetCellCulturePairQueryVariables,
      options?: UseQueryOptions<GetCellCulturePairQuery, TError, TData>
    ) =>
    useQuery<GetCellCulturePairQuery, TError, TData>(
      ['getCellCulturePair', variables],
      fetcher<GetCellCulturePairQuery, GetCellCulturePairQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetCellCulturePairDocument, variables),
      options
    );
export const InsertCellCulturePairDocument = `
    mutation insertCellCulturePair($insertOptions: CellCulturePairInsertOptions!) {
  insertCellCulturePair(insertOptions: $insertOptions) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}`;
export const useInsertCellCulturePairMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<InsertCellCulturePairMutation, TError, InsertCellCulturePairMutationVariables, TContext>
    ) =>
    useMutation<InsertCellCulturePairMutation, TError, InsertCellCulturePairMutationVariables, TContext>(
      ['insertCellCulturePair'],
      (variables?: InsertCellCulturePairMutationVariables) => fetcher<InsertCellCulturePairMutation, InsertCellCulturePairMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, InsertCellCulturePairDocument, variables)(),
      options
    );
export const UpdateCellCulturePairDocument = `
    mutation updateCellCulturePair($updateOptions: CellCulturePairUpdateOptions!) {
  updateCellCulturePair(updateOptions: $updateOptions) {
    ...CellCultureParts
  }
}
    ${CellCulturePartsFragmentDoc}`;
export const useUpdateCellCulturePairMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<UpdateCellCulturePairMutation, TError, UpdateCellCulturePairMutationVariables, TContext>
    ) =>
    useMutation<UpdateCellCulturePairMutation, TError, UpdateCellCulturePairMutationVariables, TContext>(
      ['updateCellCulturePair'],
      (variables?: UpdateCellCulturePairMutationVariables) => fetcher<UpdateCellCulturePairMutation, UpdateCellCulturePairMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, UpdateCellCulturePairDocument, variables)(),
      options
    );
export const GetCulturesDocument = `
    query getCultures($fetchOptions: CultureFetchOptions!) {
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
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetCulturesQueryVariables,
      options?: UseQueryOptions<GetCulturesQuery, TError, TData>
    ) =>
    useQuery<GetCulturesQuery, TError, TData>(
      ['getCultures', variables],
      fetcher<GetCulturesQuery, GetCulturesQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetCulturesDocument, variables),
      options
    );
export const GetCultureDocument = `
    query getCulture($fetchOptions: CultureFetchOptions!) {
  culture(fetchOptions: $fetchOptions) {
    ...CultureParts
  }
}
    ${CulturePartsFragmentDoc}`;
export const useGetCultureQuery = <
      TData = GetCultureQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetCultureQueryVariables,
      options?: UseQueryOptions<GetCultureQuery, TError, TData>
    ) =>
    useQuery<GetCultureQuery, TError, TData>(
      ['getCulture', variables],
      fetcher<GetCultureQuery, GetCultureQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetCultureDocument, variables),
      options
    );
export const GetUnpairedCulturesDocument = `
    query getUnpairedCultures($fetchOptions: CultureFetchUnpairedOptions!) {
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
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetUnpairedCulturesQueryVariables,
      options?: UseQueryOptions<GetUnpairedCulturesQuery, TError, TData>
    ) =>
    useQuery<GetUnpairedCulturesQuery, TError, TData>(
      ['getUnpairedCultures', variables],
      fetcher<GetUnpairedCulturesQuery, GetUnpairedCulturesQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetUnpairedCulturesDocument, variables),
      options
    );
export const InsertCultureDocument = `
    mutation insertCulture($insertOptions: CultureInsertOptions!) {
  insertCulture(insertOptions: $insertOptions) {
    ...CultureParts
  }
}
    ${CulturePartsFragmentDoc}`;
export const useInsertCultureMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<InsertCultureMutation, TError, InsertCultureMutationVariables, TContext>
    ) =>
    useMutation<InsertCultureMutation, TError, InsertCultureMutationVariables, TContext>(
      ['insertCulture'],
      (variables?: InsertCultureMutationVariables) => fetcher<InsertCultureMutation, InsertCultureMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, InsertCultureDocument, variables)(),
      options
    );
export const UpdateCultureDocument = `
    mutation updateCulture($updateOptions: CultureUpdateOptions!) {
  updateCulture(updateOptions: $updateOptions) {
    ...CultureParts
  }
}
    ${CulturePartsFragmentDoc}`;
export const useUpdateCultureMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<UpdateCultureMutation, TError, UpdateCultureMutationVariables, TContext>
    ) =>
    useMutation<UpdateCultureMutation, TError, UpdateCultureMutationVariables, TContext>(
      ['updateCulture'],
      (variables?: UpdateCultureMutationVariables) => fetcher<UpdateCultureMutation, UpdateCultureMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, UpdateCultureDocument, variables)(),
      options
    );
export const GetEntriesDocument = `
    query getEntries($fetchOptions: EntryFetchOptions!) {
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
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetEntriesQueryVariables,
      options?: UseQueryOptions<GetEntriesQuery, TError, TData>
    ) =>
    useQuery<GetEntriesQuery, TError, TData>(
      ['getEntries', variables],
      fetcher<GetEntriesQuery, GetEntriesQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetEntriesDocument, variables),
      options
    );
export const GetEntryDocument = `
    query getEntry($fetchOptions: EntryFetchOptions!) {
  entry(fetchOptions: $fetchOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}`;
export const useGetEntryQuery = <
      TData = GetEntryQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetEntryQueryVariables,
      options?: UseQueryOptions<GetEntryQuery, TError, TData>
    ) =>
    useQuery<GetEntryQuery, TError, TData>(
      ['getEntry', variables],
      fetcher<GetEntryQuery, GetEntryQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetEntryDocument, variables),
      options
    );
export const InsertEntryDocument = `
    mutation insertEntry($insertOptions: EntryInsertOptions!) {
  insertEntry(insertOptions: $insertOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}`;
export const useInsertEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<InsertEntryMutation, TError, InsertEntryMutationVariables, TContext>
    ) =>
    useMutation<InsertEntryMutation, TError, InsertEntryMutationVariables, TContext>(
      ['insertEntry'],
      (variables?: InsertEntryMutationVariables) => fetcher<InsertEntryMutation, InsertEntryMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, InsertEntryDocument, variables)(),
      options
    );
export const UpdateEntryDocument = `
    mutation updateEntry($updateOptions: EntryUpdateOptions!) {
  updateEntry(updateOptions: $updateOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}`;
export const useUpdateEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      options?: UseMutationOptions<UpdateEntryMutation, TError, UpdateEntryMutationVariables, TContext>
    ) =>
    useMutation<UpdateEntryMutation, TError, UpdateEntryMutationVariables, TContext>(
      ['updateEntry'],
      (variables?: UpdateEntryMutationVariables) => fetcher<UpdateEntryMutation, UpdateEntryMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, UpdateEntryDocument, variables)(),
      options
    );