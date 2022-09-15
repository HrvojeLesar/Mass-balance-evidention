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
  id?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};

export type BuyerInsertOptions = {
  address?: InputMaybe<Scalars['String']>;
  contact?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
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
  idCell: Scalars['Int'];
  idCulture: Scalars['Int'];
  limit?: InputMaybe<Scalars['Int']>;
};

export type CellCulturePairInsertOptions = {
  idCell: Scalars['Int'];
  idCulture: Scalars['Int'];
};

export type CellCulturePairUpdateOptions = {
  idCellNew: Scalars['Int'];
  idCellOld: Scalars['Int'];
  idCultureNew: Scalars['Int'];
  idCultureOld: Scalars['Int'];
};

export type CellFetchOptions = {
  id?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};

export type CellInsertOptions = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CellUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type Culture = {
  __typename?: 'Culture';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CultureFetchOptions = {
  id?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};

export type CultureInsertOptions = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CultureUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
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
  id?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};

export type EntryInsertOptions = {
  cellCulturePair: CellCulturePairInsertOptions;
  date: Scalars['DateTime'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
};

export type EntryUpdateOptions = {
  cellCulturePair?: InputMaybe<CellCulturePairInsertOptions>;
  date?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['String']>;
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

export type QueryRoot = {
  __typename?: 'QueryRoot';
  buyer: Buyer;
  buyers: Array<Buyer>;
  cell: Cell;
  cellCulture: CellCulturePair;
  cellCulturePairs: Array<CellCulturePair>;
  cells: Array<Cell>;
  culture: Culture;
  cultures: Array<Culture>;
  entries: Array<Entry>;
  entry: Entry;
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

export type GetBuyersQueryVariables = Exact<{
  fetchOptions: BuyerFetchOptions;
}>;


export type GetBuyersQuery = { __typename?: 'QueryRoot', buyers: Array<{ __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any }> };

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


export type GetCellsQuery = { __typename?: 'QueryRoot', cells: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any }> };

export type GetCellQueryVariables = Exact<{
  fetchOptions: CellFetchOptions;
}>;


export type GetCellQuery = { __typename?: 'QueryRoot', cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } };

export type InsertCellMutationVariables = Exact<{
  insertOptions: CellInsertOptions;
}>;


export type InsertCellMutation = { __typename?: 'MutationRoot', insertCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } };

export type UpdateCellMutationVariables = Exact<{
  updateOptions: CellUpdateOptions;
}>;


export type UpdateCellMutation = { __typename?: 'MutationRoot', updateCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any } };

export type CellPartsFragment = { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any };

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
export const GetBuyersDocument = `
    query getBuyers($fetchOptions: BuyerFetchOptions!) {
  buyers(fetchOptions: $fetchOptions) {
    ...BuyerParts
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
    ...CellParts
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