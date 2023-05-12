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
    ...({"credentials":"include"}),
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
  /**
   * ISO 8601 calendar date without timezone.
   * Format: %Y-%m-%d
   *
   * # Examples
   *
   * * `1994-11-13`
   * * `2000-02-24`
   */
  NaiveDate: any;
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

export type Article = {
  __typename?: 'Article';
  createdAt: Scalars['DateTime'];
  dGroup: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type ArticleFetchOptions = {
  dGroup: Scalars['Int'];
  filters?: InputMaybe<Array<ArticleFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<ArticleOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum ArticleFields {
  Description = 'DESCRIPTION',
  Id = 'ID',
  Name = 'NAME'
}

export type ArticleFilterOptions = {
  field: ArticleFields;
  value: Scalars['String'];
};

export type ArticleInsertOptions = {
  dGroup: Scalars['Int'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type ArticleOrderingOptions = {
  order: Ordering;
  orderBy: ArticleFields;
};

export type ArticleResults = {
  __typename?: 'ArticleResults';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<Article>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type ArticleUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type Buyer = {
  __typename?: 'Buyer';
  address?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  dGroup: Scalars['Int'];
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
};

export type BuyerFetchOptions = {
  dGroup: Scalars['Int'];
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
  value: Scalars['String'];
};

export type BuyerInsertOptions = {
  address?: InputMaybe<Scalars['String']>;
  contact?: InputMaybe<Scalars['String']>;
  dGroup: Scalars['Int'];
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
  dGroup: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CellCultureFetchOptions = {
  dGroup: Scalars['Int'];
  filters?: InputMaybe<Array<CellCultureFilterOptions>>;
  id?: InputMaybe<CellCulturePairIds>;
  ordering?: InputMaybe<CellCultureOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export type CellCultureFilterOptions = {
  field: CellCulturePairFields;
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
  id: Scalars['Int'];
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
  id: Scalars['Int'];
  idCell?: InputMaybe<Scalars['Int']>;
  idCulture?: InputMaybe<Scalars['Int']>;
};

export type CellFetchOptions = {
  dGroup: Scalars['Int'];
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
  value: Scalars['String'];
};

export type CellInsertOptions = {
  dGroup: Scalars['Int'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CellOrderingOptions = {
  order: Ordering;
  orderBy: CellFields;
};

export type CellParity = {
  /** Id refers to a Culture Id */
  idCulture?: InputMaybe<Scalars['Int']>;
};

export type CellParityFetchOptions = {
  dGroup: Scalars['Int'];
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

export enum Comparator {
  Eq = 'EQ',
  Gt = 'GT',
  Gte = 'GTE',
  Lt = 'LT',
  Lte = 'LTE',
  Ne = 'NE'
}

export type Culture = {
  __typename?: 'Culture';
  createdAt: Scalars['DateTime'];
  dGroup: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type CultureFetchOptions = {
  dGroup: Scalars['Int'];
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
  value: Scalars['String'];
};

export type CultureInsertOptions = {
  dGroup: Scalars['Int'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CultureOrderingOptions = {
  order: Ordering;
  orderBy: CultureFields;
};

export type CultureParity = {
  /** Id refers to a Cell Id */
  idCell?: InputMaybe<Scalars['Int']>;
};

export type CultureParityFetchOptions = {
  dGroup: Scalars['Int'];
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
  idMbeGroup: Scalars['Int'];
  name: Scalars['String'];
};

export type DataGroupInsertOptions = {
  description?: InputMaybe<Scalars['String']>;
  idMbeGroup: Scalars['Int'];
  name: Scalars['String'];
};

export type DataGroupUpdateOptions = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type DeleteOptions = {
  id: Scalars['Int'];
};

export type DeleteOptionsWeightType = {
  id: WeightTypeDeleteOptions;
};

export type DispatchNote = {
  __typename?: 'DispatchNote';
  createdAt: Scalars['DateTime'];
  dGroup: Scalars['Int'];
  id: Scalars['Int'];
  issuingDate?: Maybe<Scalars['NaiveDate']>;
  noteType?: Maybe<Scalars['Int']>;
  numericalIdentifier?: Maybe<Scalars['Int']>;
};

export type DispatchNoteArticle = {
  __typename?: 'DispatchNoteArticle';
  article: Article;
  createdAt: Scalars['DateTime'];
  dGroup: DataGroup;
  dispatchNote: DispatchNote;
  id: Scalars['Int'];
  quantity: Scalars['Float'];
  weightType: WeightType;
};

export type DispatchNoteArticleFetchOptions = {
  dGroup: Scalars['Int'];
  filters?: InputMaybe<Array<DispatchNoteArticleFilterOptions>>;
  id?: InputMaybe<DispatchNoteArticleIds>;
  ordering?: InputMaybe<DispatchNoteArticleOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum DispatchNoteArticleFields {
  ArticleDescription = 'ARTICLE_DESCRIPTION',
  ArticleName = 'ARTICLE_NAME',
  Quantity = 'QUANTITY',
  WeightType = 'WEIGHT_TYPE'
}

export type DispatchNoteArticleFilterOptions = {
  field: DispatchNoteArticleFields;
  value: Scalars['String'];
};

export type DispatchNoteArticleIds = {
  idArticle?: InputMaybe<Scalars['Int']>;
  idDispatchNote?: InputMaybe<Scalars['Int']>;
};

export type DispatchNoteArticleInsertOptions = {
  dGroup: Scalars['Int'];
  idArticle: Scalars['Int'];
  idDispatchNote: Scalars['Int'];
  quantity: Scalars['Float'];
  weightType: Scalars['Int'];
};

export type DispatchNoteArticleOrderingOptions = {
  order: Ordering;
  orderBy: DispatchNoteArticleFields;
};

export type DispatchNoteArticleResults = {
  __typename?: 'DispatchNoteArticleResults';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<DispatchNoteArticle>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type DispatchNoteArticleUpdateOptions = {
  id: Scalars['Int'];
  idArticle?: InputMaybe<Scalars['Int']>;
  idDispatchNote?: InputMaybe<Scalars['Int']>;
  quantity?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['Int']>;
};

export type DispatchNoteFetchOptions = {
  dGroup: Scalars['Int'];
  filters?: InputMaybe<Array<DispatchNoteFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  ordering?: InputMaybe<DispatchNoteOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum DispatchNoteFields {
  Id = 'ID',
  IssuingDate = 'ISSUING_DATE',
  NoteType = 'NOTE_TYPE',
  NumericalIdentifier = 'NUMERICAL_IDENTIFIER'
}

export type DispatchNoteFilterOptions = {
  field: DispatchNoteFields;
  value: DispatchNoteFilterValue;
};

export type DispatchNoteFilterValue = {
  comparator?: InputMaybe<Comparator>;
  /**
   * Number, date or date range as string
   * Date range is expected to be in format Date, Date
   */
  value: Scalars['String'];
};

export type DispatchNoteInsertOptions = {
  dGroup: Scalars['Int'];
  issuingDate?: InputMaybe<Scalars['DateTime']>;
  noteType?: InputMaybe<Scalars['Int']>;
  numericalIdentifier?: InputMaybe<Scalars['Int']>;
};

export type DispatchNoteOrderingOptions = {
  order: Ordering;
  orderBy: DispatchNoteFields;
};

export type DispatchNoteResults = {
  __typename?: 'DispatchNoteResults';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<DispatchNote>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type DispatchNoteUpdateOptions = {
  id: Scalars['Int'];
  issuingDate?: InputMaybe<Scalars['DateTime']>;
  noteType?: InputMaybe<Scalars['Int']>;
  numericalIdentifier?: InputMaybe<Scalars['Int']>;
};

export type Entry = {
  __typename?: 'Entry';
  buyer: Buyer;
  cell: Cell;
  createdAt: Scalars['DateTime'];
  culture: Culture;
  dGroup: DataGroup;
  date: Scalars['NaiveDate'];
  id: Scalars['Int'];
  weight?: Maybe<Scalars['Float']>;
  weightType: WeightType;
};

export type EntryFetchOptions = {
  dGroup: Scalars['Int'];
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
  value: Scalars['String'];
};

export type EntryInsertOptions = {
  dGroup: Scalars['Int'];
  date: Scalars['DateTime'];
  idBuyer: Scalars['Int'];
  idCell: Scalars['Int'];
  idCulture: Scalars['Int'];
  weight?: InputMaybe<Scalars['Float']>;
  weightType: Scalars['Int'];
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
  dGroup?: InputMaybe<Scalars['Int']>;
  date?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  idBuyer?: InputMaybe<Scalars['Int']>;
  pairIds?: InputMaybe<PairIds>;
  weight?: InputMaybe<Scalars['Float']>;
  weightType?: InputMaybe<Scalars['Int']>;
};

export type MbeGroup = {
  __typename?: 'MbeGroup';
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  owner: Scalars['Int'];
};

export type MbeGroupInsertOptions = {
  name: Scalars['String'];
};

export type MbeGroupMembers = {
  __typename?: 'MbeGroupMembers';
  idMbeGroup: Scalars['Int'];
  idMbeUser: Scalars['Int'];
};

export type MbeGroupMembersFlattened = {
  __typename?: 'MbeGroupMembersFlattened';
  email: Scalars['String'];
  groupName: Scalars['String'];
  idGroup: Scalars['Int'];
  idUser: Scalars['Int'];
};

export type MbeGroupMembersOptions = {
  idMbeGroup: Scalars['Int'];
  memberEmail: Scalars['String'];
};

export type MbeGroupMembersQueryOptions = {
  idMbeGroup: Scalars['Int'];
};

export type MbeUser = {
  __typename?: 'MbeUser';
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['Int'];
};

export type MbeUserInsertOptions = {
  email: Scalars['String'];
};

export type MutationRoot = {
  __typename?: 'MutationRoot';
  deleteArticle: RowsDeleted;
  deleteBuyer: RowsDeleted;
  deleteCell: RowsDeleted;
  deleteCellCulturePair: RowsDeleted;
  deleteCulture: RowsDeleted;
  deleteDataGroup: RowsDeleted;
  deleteDispatchNote: RowsDeleted;
  deleteDispatchNoteArticle: RowsDeleted;
  deleteEntry: RowsDeleted;
  deleteWeightTypes: RowsDeleted;
  insertArticle: Article;
  insertBuyer: Buyer;
  insertCell: Cell;
  insertCellCulturePair: CellCulturePair;
  insertCulture: Culture;
  insertDataGroup: DataGroup;
  insertDispatchNote: DispatchNote;
  insertDispatchNoteArticle: DispatchNoteArticle;
  insertEntry: Entry;
  insertGroupMember: MbeGroupMembers;
  insertMbeGroup: MbeGroup;
  insertMbeUser: MbeUser;
  insertWeightTypes: WeightType;
  removeGroupMember: RowsDeleted;
  updateArticle: Article;
  updateBuyer: Buyer;
  updateCell: Cell;
  updateCellCulturePair: CellCulturePair;
  updateCulture: Culture;
  updateDataGroup: DataGroup;
  updateDispatchNote: DispatchNote;
  updateDispatchNoteArticle: DispatchNoteArticle;
  updateEntry: Entry;
  updateWeightTypes: WeightType;
};


export type MutationRootDeleteArticleArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteBuyerArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteCellArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteCellCulturePairArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteCultureArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteDataGroupArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteDispatchNoteArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteDispatchNoteArticleArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteEntryArgs = {
  options: DeleteOptions;
};


export type MutationRootDeleteWeightTypesArgs = {
  options: DeleteOptionsWeightType;
};


export type MutationRootInsertArticleArgs = {
  options: ArticleInsertOptions;
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


export type MutationRootInsertDispatchNoteArgs = {
  options: DispatchNoteInsertOptions;
};


export type MutationRootInsertDispatchNoteArticleArgs = {
  options: DispatchNoteArticleInsertOptions;
};


export type MutationRootInsertEntryArgs = {
  options: EntryInsertOptions;
};


export type MutationRootInsertGroupMemberArgs = {
  options: MbeGroupMembersOptions;
};


export type MutationRootInsertMbeGroupArgs = {
  options: MbeGroupInsertOptions;
};


export type MutationRootInsertMbeUserArgs = {
  options: MbeUserInsertOptions;
};


export type MutationRootInsertWeightTypesArgs = {
  options: WeightTypeInsertOptions;
};


export type MutationRootRemoveGroupMemberArgs = {
  options: MbeGroupMembersOptions;
};


export type MutationRootUpdateArticleArgs = {
  options: ArticleUpdateOptions;
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


export type MutationRootUpdateDispatchNoteArgs = {
  options: DispatchNoteUpdateOptions;
};


export type MutationRootUpdateDispatchNoteArticleArgs = {
  options: DispatchNoteArticleUpdateOptions;
};


export type MutationRootUpdateEntryArgs = {
  options: EntryUpdateOptions;
};


export type MutationRootUpdateWeightTypesArgs = {
  options: WeightTypeUpdateOptions;
};

export enum Ordering {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type PairIds = {
  idCell: Scalars['Int'];
  idCulture: Scalars['Int'];
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  allCellCulturePairs: AllCellCulturePairs;
  allEntries: AllEntires;
  articles: ArticleResults;
  buyers: BuyerResult;
  cellCulturePairs: CellCulturePairResult;
  cells: CellResult;
  cultures: CultureResult;
  dataGroups: Array<DataGroup>;
  dispatchNoteArticles: DispatchNoteArticleResults;
  dispatchNotes: DispatchNoteResults;
  entries: EntryResult;
  mbeGroupMembers: Array<MbeGroupMembersFlattened>;
  mbeGroups: Array<MbeGroup>;
  pairedCells: CellResult;
  pairedCultures: CultureResult;
  unpairedCells: CellResult;
  unpairedCultures: CultureResult;
  weightTypes: WeightTypeResults;
};


export type QueryRootAllCellCulturePairsArgs = {
  options: CellCultureFetchOptions;
};


export type QueryRootAllEntriesArgs = {
  options: EntryFetchOptions;
};


export type QueryRootArticlesArgs = {
  options: ArticleFetchOptions;
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


export type QueryRootDispatchNoteArticlesArgs = {
  options: DispatchNoteArticleFetchOptions;
};


export type QueryRootDispatchNotesArgs = {
  options: DispatchNoteFetchOptions;
};


export type QueryRootEntriesArgs = {
  options: EntryFetchOptions;
};


export type QueryRootMbeGroupMembersArgs = {
  options: MbeGroupMembersQueryOptions;
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


export type QueryRootWeightTypesArgs = {
  options: WeightTypeFetchOptions;
};

export type RowsDeleted = {
  __typename?: 'RowsDeleted';
  numRows: Scalars['Int'];
};

export type WeightType = {
  __typename?: 'WeightType';
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  unit: Scalars['String'];
  unitShort: Scalars['String'];
};

export type WeightTypeDeleteOptions = {
  id: Scalars['Int'];
  mbeGroup: Scalars['Int'];
};

export type WeightTypeFetchOptions = {
  filters?: InputMaybe<Array<WeightTypeFilterOptions>>;
  id?: InputMaybe<Scalars['Int']>;
  mbeGroupId: Scalars['Int'];
  ordering?: InputMaybe<WeightTypeOrderingOptions>;
  page?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export enum WeightTypeFields {
  Id = 'ID',
  Unit = 'UNIT',
  UnitShort = 'UNIT_SHORT'
}

export type WeightTypeFilterOptions = {
  field: WeightTypeFields;
  value: Scalars['String'];
};

export type WeightTypeInsertOptions = {
  mbeGroup: Scalars['Int'];
  unit: Scalars['String'];
  unitShort: Scalars['String'];
};

export type WeightTypeOrderingOptions = {
  order: Ordering;
  orderBy: WeightTypeFields;
};

export type WeightTypeResults = {
  __typename?: 'WeightTypeResults';
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<WeightType>;
  totalItems: Scalars['Int'];
  totalPages: Scalars['Int'];
};

export type WeightTypeUpdateOptions = {
  id: Scalars['Int'];
  mbeGroup: Scalars['Int'];
  unit?: InputMaybe<Scalars['String']>;
  unitShort?: InputMaybe<Scalars['String']>;
};

export type GetArticlesQueryVariables = Exact<{
  options: ArticleFetchOptions;
}>;


export type GetArticlesQuery = { __typename?: 'QueryRoot', articles: { __typename?: 'ArticleResults', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Article', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }> } };

export type InsertArticleMutationVariables = Exact<{
  insertOptions: ArticleInsertOptions;
}>;


export type InsertArticleMutation = { __typename?: 'MutationRoot', insertArticle: { __typename?: 'Article', id: number, name: string, description?: string | null, createdAt: any, dGroup: number } };

export type UpdateArticleMutationVariables = Exact<{
  updateOptions: ArticleUpdateOptions;
}>;


export type UpdateArticleMutation = { __typename?: 'MutationRoot', updateArticle: { __typename?: 'Article', id: number, name: string, description?: string | null, createdAt: any, dGroup: number } };

export type DeleteArticleMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteArticleMutation = { __typename?: 'MutationRoot', deleteArticle: { __typename?: 'RowsDeleted', numRows: number } };

export type ArticlePartsFragment = { __typename?: 'Article', id: number, name: string, description?: string | null, createdAt: any, dGroup: number };

export type GetBuyersQueryVariables = Exact<{
  options: BuyerFetchOptions;
}>;


export type GetBuyersQuery = { __typename?: 'QueryRoot', buyers: { __typename?: 'BuyerResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number }> } };

export type InsertBuyerMutationVariables = Exact<{
  insertOptions: BuyerInsertOptions;
}>;


export type InsertBuyerMutation = { __typename?: 'MutationRoot', insertBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number } };

export type UpdateBuyerMutationVariables = Exact<{
  updateOptions: BuyerUpdateOptions;
}>;


export type UpdateBuyerMutation = { __typename?: 'MutationRoot', updateBuyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number } };

export type DeleteBuyerMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteBuyerMutation = { __typename?: 'MutationRoot', deleteBuyer: { __typename?: 'RowsDeleted', numRows: number } };

export type BuyerPartsFragment = { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number };

export type GetCellsQueryVariables = Exact<{
  options: CellFetchOptions;
}>;


export type GetCellsQuery = { __typename?: 'QueryRoot', cells: { __typename?: 'CellResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }> } };

export type GetUnpairedCellsQueryVariables = Exact<{
  options: CellParityFetchOptions;
}>;


export type GetUnpairedCellsQuery = { __typename?: 'QueryRoot', unpairedCells: { __typename?: 'CellResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }> } };

export type GetPairedCellsQueryVariables = Exact<{
  options: CellParityFetchOptions;
}>;


export type GetPairedCellsQuery = { __typename?: 'QueryRoot', pairedCells: { __typename?: 'CellResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }> } };

export type InsertCellMutationVariables = Exact<{
  insertOptions: CellInsertOptions;
}>;


export type InsertCellMutation = { __typename?: 'MutationRoot', insertCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number } };

export type UpdateCellMutationVariables = Exact<{
  updateOptions: CellUpdateOptions;
}>;


export type UpdateCellMutation = { __typename?: 'MutationRoot', updateCell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number } };

export type DeleteCellMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteCellMutation = { __typename?: 'MutationRoot', deleteCell: { __typename?: 'RowsDeleted', numRows: number } };

export type CellPartsFragment = { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number };

export type GetCellCulturesPairsQueryVariables = Exact<{
  options: CellCultureFetchOptions;
}>;


export type GetCellCulturesPairsQuery = { __typename?: 'QueryRoot', cellCulturePairs: { __typename?: 'CellCulturePairResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'CellCulturePair', id: number, createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } }> } };

export type GetAllCellCulturePairsQueryVariables = Exact<{
  options: CellCultureFetchOptions;
}>;


export type GetAllCellCulturePairsQuery = { __typename?: 'QueryRoot', allCellCulturePairs: { __typename?: 'AllCellCulturePairs', total: number, results: Array<{ __typename?: 'CellCulturePair', id: number, createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } }> } };

export type InsertCellCulturePairMutationVariables = Exact<{
  insertOptions: CellCulturePairIds;
}>;


export type InsertCellCulturePairMutation = { __typename?: 'MutationRoot', insertCellCulturePair: { __typename?: 'CellCulturePair', id: number, createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } } };

export type UpdateCellCulturePairMutationVariables = Exact<{
  updateOptions: CellCulturePairUpdateOptions;
}>;


export type UpdateCellCulturePairMutation = { __typename?: 'MutationRoot', updateCellCulturePair: { __typename?: 'CellCulturePair', id: number, createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } } };

export type DeleteCellCulturePairMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteCellCulturePairMutation = { __typename?: 'MutationRoot', deleteCellCulturePair: { __typename?: 'RowsDeleted', numRows: number } };

export type GetCulturesQueryVariables = Exact<{
  options: CultureFetchOptions;
}>;


export type GetCulturesQuery = { __typename?: 'QueryRoot', cultures: { __typename?: 'CultureResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }> } };

export type GetUnpairedCulturesQueryVariables = Exact<{
  options: CultureParityFetchOptions;
}>;


export type GetUnpairedCulturesQuery = { __typename?: 'QueryRoot', unpairedCultures: { __typename?: 'CultureResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }> } };

export type GetPairedCulturesQueryVariables = Exact<{
  options: CultureParityFetchOptions;
}>;


export type GetPairedCulturesQuery = { __typename?: 'QueryRoot', pairedCultures: { __typename?: 'CultureResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }> } };

export type InsertCultureMutationVariables = Exact<{
  insertOptions: CultureInsertOptions;
}>;


export type InsertCultureMutation = { __typename?: 'MutationRoot', insertCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number } };

export type UpdateCultureMutationVariables = Exact<{
  updateOptions: CultureUpdateOptions;
}>;


export type UpdateCultureMutation = { __typename?: 'MutationRoot', updateCulture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number } };

export type DeleteCultureMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteCultureMutation = { __typename?: 'MutationRoot', deleteCulture: { __typename?: 'RowsDeleted', numRows: number } };

export type CulturePartsFragment = { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number };

export type GetDataGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDataGroupsQuery = { __typename?: 'QueryRoot', dataGroups: Array<{ __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any }> };

export type InsertDataGroupMutationVariables = Exact<{
  insertOptions: DataGroupInsertOptions;
}>;


export type InsertDataGroupMutation = { __typename?: 'MutationRoot', insertDataGroup: { __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any } };

export type UpdateDataGroupMutationVariables = Exact<{
  updateOptions: DataGroupUpdateOptions;
}>;


export type UpdateDataGroupMutation = { __typename?: 'MutationRoot', updateDataGroup: { __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any } };

export type DeleteDataGroupMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteDataGroupMutation = { __typename?: 'MutationRoot', deleteDataGroup: { __typename?: 'RowsDeleted', numRows: number } };

export type DataGroupPartsFragment = { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any };

export type GetDispatchNotesQueryVariables = Exact<{
  options: DispatchNoteFetchOptions;
}>;


export type GetDispatchNotesQuery = { __typename?: 'QueryRoot', dispatchNotes: { __typename?: 'DispatchNoteResults', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, createdAt: any, dGroup: number }> } };

export type InsertDispatchNoteMutationVariables = Exact<{
  insertOptions: DispatchNoteInsertOptions;
}>;


export type InsertDispatchNoteMutation = { __typename?: 'MutationRoot', insertDispatchNote: { __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, createdAt: any, dGroup: number } };

export type UpdateDispatchNoteMutationVariables = Exact<{
  updateOptions: DispatchNoteUpdateOptions;
}>;


export type UpdateDispatchNoteMutation = { __typename?: 'MutationRoot', updateDispatchNote: { __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, createdAt: any, dGroup: number } };

export type DeleteDispatchNoteMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteDispatchNoteMutation = { __typename?: 'MutationRoot', deleteDispatchNote: { __typename?: 'RowsDeleted', numRows: number } };

export type DispatchNotePartsFragment = { __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, createdAt: any, dGroup: number };

export type GetDispatchNotesArticlesQueryVariables = Exact<{
  options: DispatchNoteArticleFetchOptions;
}>;


export type GetDispatchNotesArticlesQuery = { __typename?: 'QueryRoot', dispatchNoteArticles: { __typename?: 'DispatchNoteArticleResults', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'DispatchNoteArticle', id: number, quantity: number, createdAt: any, dispatchNote: { __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, dGroup: number, createdAt: any }, article: { __typename?: 'Article', id: number, name: string, description?: string | null, dGroup: number, createdAt: any }, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } }> } };

export type InsertDispatchNoteArticleMutationVariables = Exact<{
  insertOptions: DispatchNoteArticleInsertOptions;
}>;


export type InsertDispatchNoteArticleMutation = { __typename?: 'MutationRoot', insertDispatchNoteArticle: { __typename?: 'DispatchNoteArticle', id: number, quantity: number, createdAt: any, dispatchNote: { __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, dGroup: number, createdAt: any }, article: { __typename?: 'Article', id: number, name: string, description?: string | null, dGroup: number, createdAt: any }, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } } };

export type UpdateDispatchNoteArticleMutationVariables = Exact<{
  updateOptions: DispatchNoteArticleUpdateOptions;
}>;


export type UpdateDispatchNoteArticleMutation = { __typename?: 'MutationRoot', updateDispatchNoteArticle: { __typename?: 'DispatchNoteArticle', id: number, quantity: number, createdAt: any, dispatchNote: { __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, dGroup: number, createdAt: any }, article: { __typename?: 'Article', id: number, name: string, description?: string | null, dGroup: number, createdAt: any }, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } } };

export type DeleteDispatchNoteArticleMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteDispatchNoteArticleMutation = { __typename?: 'MutationRoot', deleteDispatchNoteArticle: { __typename?: 'RowsDeleted', numRows: number } };

export type WeightTypePartsFragment = { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any };

export type DispatchNoteArticlePartsFragment = { __typename?: 'DispatchNoteArticle', id: number, quantity: number, createdAt: any, dispatchNote: { __typename?: 'DispatchNote', id: number, noteType?: number | null, numericalIdentifier?: number | null, issuingDate?: any | null, dGroup: number, createdAt: any }, article: { __typename?: 'Article', id: number, name: string, description?: string | null, dGroup: number, createdAt: any }, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any, idMbeGroup: number } };

export type GetEntriesQueryVariables = Exact<{
  options: EntryFetchOptions;
}>;


export type GetEntriesQuery = { __typename?: 'QueryRoot', entries: { __typename?: 'EntryResult', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'Entry', id: number, weight?: number | null, date: any, createdAt: any, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, buyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number }, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any } }> } };

export type GetAllEntriesQueryVariables = Exact<{
  options: EntryFetchOptions;
}>;


export type GetAllEntriesQuery = { __typename?: 'QueryRoot', allEntries: { __typename?: 'AllEntires', total: number, results: Array<{ __typename?: 'Entry', id: number, weight?: number | null, date: any, createdAt: any, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, buyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number }, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any } }> } };

export type InsertEntryMutationVariables = Exact<{
  insertOptions: EntryInsertOptions;
}>;


export type InsertEntryMutation = { __typename?: 'MutationRoot', insertEntry: { __typename?: 'Entry', id: number, weight?: number | null, date: any, createdAt: any, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, buyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number }, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any } } };

export type UpdateEntryMutationVariables = Exact<{
  updateOptions: EntryUpdateOptions;
}>;


export type UpdateEntryMutation = { __typename?: 'MutationRoot', updateEntry: { __typename?: 'Entry', id: number, weight?: number | null, date: any, createdAt: any, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, buyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number }, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any } } };

export type DeleteEntryMutationVariables = Exact<{
  deleteOptions: DeleteOptions;
}>;


export type DeleteEntryMutation = { __typename?: 'MutationRoot', deleteEntry: { __typename?: 'RowsDeleted', numRows: number } };

export type CellCulturePartsFragment = { __typename?: 'CellCulturePair', createdAt: any, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', id: number, name: string, description?: string | null, createdAt: any } };

export type EntryPartsFragment = { __typename?: 'Entry', id: number, weight?: number | null, date: any, createdAt: any, weightType: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }, buyer: { __typename?: 'Buyer', id: number, name?: string | null, address?: string | null, contact?: string | null, createdAt: any, dGroup: number }, cell: { __typename?: 'Cell', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, culture: { __typename?: 'Culture', id: number, name: string, description?: string | null, createdAt: any, dGroup: number }, dGroup: { __typename?: 'DataGroup', idMbeGroup: number, id: number, name: string, description?: string | null, createdAt: any } };

export type GetMbeGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMbeGroupsQuery = { __typename?: 'QueryRoot', mbeGroups: Array<{ __typename?: 'MbeGroup', id: number, name: string, owner: number, createdAt: any }> };

export type GetGroupMembersQueryVariables = Exact<{
  options: MbeGroupMembersQueryOptions;
}>;


export type GetGroupMembersQuery = { __typename?: 'QueryRoot', mbeGroupMembers: Array<{ __typename?: 'MbeGroupMembersFlattened', idUser: number, email: string, idGroup: number, groupName: string }> };

export type InsertMbeGroupMutationVariables = Exact<{
  options: MbeGroupInsertOptions;
}>;


export type InsertMbeGroupMutation = { __typename?: 'MutationRoot', insertMbeGroup: { __typename?: 'MbeGroup', id: number, name: string, owner: number, createdAt: any } };

export type InsertMbeGroupMemberMutationVariables = Exact<{
  options: MbeGroupMembersOptions;
}>;


export type InsertMbeGroupMemberMutation = { __typename?: 'MutationRoot', insertGroupMember: { __typename?: 'MbeGroupMembers', idMbeUser: number, idMbeGroup: number } };

export type RemoveMbeGroupMemberMutationVariables = Exact<{
  options: MbeGroupMembersOptions;
}>;


export type RemoveMbeGroupMemberMutation = { __typename?: 'MutationRoot', removeGroupMember: { __typename?: 'RowsDeleted', numRows: number } };

export type InsertUserMutationVariables = Exact<{
  options: MbeUserInsertOptions;
}>;


export type InsertUserMutation = { __typename?: 'MutationRoot', insertMbeUser: { __typename?: 'MbeUser', id: number, email: string, createdAt: any } };

export type GetWeightTypesQueryVariables = Exact<{
  options: WeightTypeFetchOptions;
}>;


export type GetWeightTypesQuery = { __typename?: 'QueryRoot', weightTypes: { __typename?: 'WeightTypeResults', page: number, pageSize: number, totalItems: number, totalPages: number, results: Array<{ __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any }> } };

export type InsertWeightTypeMutationVariables = Exact<{
  options: WeightTypeInsertOptions;
}>;


export type InsertWeightTypeMutation = { __typename?: 'MutationRoot', insertWeightTypes: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any } };

export type UpdateWeightTypesMutationVariables = Exact<{
  options: WeightTypeUpdateOptions;
}>;


export type UpdateWeightTypesMutation = { __typename?: 'MutationRoot', updateWeightTypes: { __typename?: 'WeightType', id: number, unitShort: string, unit: string, createdAt: any } };

export type DeleteWeightTypesMutationVariables = Exact<{
  options: DeleteOptionsWeightType;
}>;


export type DeleteWeightTypesMutation = { __typename?: 'MutationRoot', deleteWeightTypes: { __typename?: 'RowsDeleted', numRows: number } };

export const ArticlePartsFragmentDoc = `
    fragment ArticleParts on Article {
  id
  name
  description
  createdAt
  dGroup
}
    `;
export const DispatchNotePartsFragmentDoc = `
    fragment DispatchNoteParts on DispatchNote {
  id
  noteType
  numericalIdentifier
  issuingDate
  createdAt
  dGroup
}
    `;
export const WeightTypePartsFragmentDoc = `
    fragment WeightTypeParts on WeightType {
  id
  unitShort
  unit
  createdAt
}
    `;
export const DispatchNoteArticlePartsFragmentDoc = `
    fragment DispatchNoteArticleParts on DispatchNoteArticle {
  id
  dispatchNote {
    id
    noteType
    numericalIdentifier
    issuingDate
    dGroup
    createdAt
  }
  article {
    id
    name
    description
    dGroup
    createdAt
  }
  weightType {
    ...WeightTypeParts
  }
  quantity
  createdAt
  dGroup {
    id
    name
    description
    createdAt
    idMbeGroup
  }
}
    `;
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
  weightType {
    ...WeightTypeParts
  }
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
    idMbeGroup
    ...DataGroupParts
  }
}
    `;
export const GetArticlesDocument = `
    query GetArticles($options: ArticleFetchOptions!) {
  articles(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...ArticleParts
    }
  }
}
    ${ArticlePartsFragmentDoc}`;
export const useGetArticlesQuery = <
      TData = GetArticlesQuery,
      TError = unknown
    >(
      variables: GetArticlesQueryVariables,
      options?: UseQueryOptions<GetArticlesQuery, TError, TData>
    ) =>
    useQuery<GetArticlesQuery, TError, TData>(
      ['GetArticles', variables],
      fetcher<GetArticlesQuery, GetArticlesQueryVariables>(GetArticlesDocument, variables),
      options
    );
export const InsertArticleDocument = `
    mutation InsertArticle($insertOptions: ArticleInsertOptions!) {
  insertArticle(options: $insertOptions) {
    ...ArticleParts
  }
}
    ${ArticlePartsFragmentDoc}`;
export const useInsertArticleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertArticleMutation, TError, InsertArticleMutationVariables, TContext>) =>
    useMutation<InsertArticleMutation, TError, InsertArticleMutationVariables, TContext>(
      ['InsertArticle'],
      (variables?: InsertArticleMutationVariables) => fetcher<InsertArticleMutation, InsertArticleMutationVariables>(InsertArticleDocument, variables)(),
      options
    );
export const UpdateArticleDocument = `
    mutation UpdateArticle($updateOptions: ArticleUpdateOptions!) {
  updateArticle(options: $updateOptions) {
    ...ArticleParts
  }
}
    ${ArticlePartsFragmentDoc}`;
export const useUpdateArticleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateArticleMutation, TError, UpdateArticleMutationVariables, TContext>) =>
    useMutation<UpdateArticleMutation, TError, UpdateArticleMutationVariables, TContext>(
      ['UpdateArticle'],
      (variables?: UpdateArticleMutationVariables) => fetcher<UpdateArticleMutation, UpdateArticleMutationVariables>(UpdateArticleDocument, variables)(),
      options
    );
export const DeleteArticleDocument = `
    mutation DeleteArticle($deleteOptions: DeleteOptions!) {
  deleteArticle(options: $deleteOptions) {
    numRows
  }
}
    `;
export const useDeleteArticleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteArticleMutation, TError, DeleteArticleMutationVariables, TContext>) =>
    useMutation<DeleteArticleMutation, TError, DeleteArticleMutationVariables, TContext>(
      ['DeleteArticle'],
      (variables?: DeleteArticleMutationVariables) => fetcher<DeleteArticleMutation, DeleteArticleMutationVariables>(DeleteArticleDocument, variables)(),
      options
    );
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
    mutation InsertBuyer($insertOptions: BuyerInsertOptions!) {
  insertBuyer(options: $insertOptions) {
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
  updateBuyer(options: $updateOptions) {
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
  deleteBuyer(options: $deleteOptions) {
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
    mutation InsertCell($insertOptions: CellInsertOptions!) {
  insertCell(options: $insertOptions) {
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
  updateCell(options: $updateOptions) {
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
  deleteCell(options: $deleteOptions) {
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
      id
      createdAt
      cell {
        id
        name
        description
        createdAt
        dGroup
      }
      culture {
        id
        name
        description
        createdAt
        dGroup
      }
      dGroup {
        id
        name
        description
        createdAt
        idMbeGroup
      }
    }
  }
}
    `;
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
      id
      createdAt
      cell {
        id
        name
        description
        createdAt
        dGroup
      }
      culture {
        id
        name
        description
        createdAt
        dGroup
      }
      dGroup {
        id
        name
        description
        createdAt
        idMbeGroup
      }
    }
  }
}
    `;
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
    mutation InsertCellCulturePair($insertOptions: CellCulturePairIds!) {
  insertCellCulturePair(options: $insertOptions) {
    id
    createdAt
    cell {
      id
      name
      description
      createdAt
      dGroup
    }
    culture {
      id
      name
      description
      createdAt
      dGroup
    }
    dGroup {
      id
      name
      description
      createdAt
      idMbeGroup
    }
  }
}
    `;
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
  updateCellCulturePair(options: $updateOptions) {
    id
    createdAt
    cell {
      id
      name
      description
      createdAt
      dGroup
    }
    culture {
      id
      name
      description
      createdAt
      dGroup
    }
    dGroup {
      id
      name
      description
      createdAt
      idMbeGroup
    }
  }
}
    `;
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
    mutation DeleteCellCulturePair($deleteOptions: DeleteOptions!) {
  deleteCellCulturePair(options: $deleteOptions) {
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
    mutation InsertCulture($insertOptions: CultureInsertOptions!) {
  insertCulture(options: $insertOptions) {
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
  updateCulture(options: $updateOptions) {
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
  deleteCulture(options: $deleteOptions) {
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
    query GetDataGroups {
  dataGroups {
    idMbeGroup
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
  insertDataGroup(options: $insertOptions) {
    idMbeGroup
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
    mutation UpdateDataGroup($updateOptions: DataGroupUpdateOptions!) {
  updateDataGroup(options: $updateOptions) {
    idMbeGroup
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
    mutation DeleteDataGroup($deleteOptions: DeleteOptions!) {
  deleteDataGroup(options: $deleteOptions) {
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
export const GetDispatchNotesDocument = `
    query GetDispatchNotes($options: DispatchNoteFetchOptions!) {
  dispatchNotes(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...DispatchNoteParts
    }
  }
}
    ${DispatchNotePartsFragmentDoc}`;
export const useGetDispatchNotesQuery = <
      TData = GetDispatchNotesQuery,
      TError = unknown
    >(
      variables: GetDispatchNotesQueryVariables,
      options?: UseQueryOptions<GetDispatchNotesQuery, TError, TData>
    ) =>
    useQuery<GetDispatchNotesQuery, TError, TData>(
      ['GetDispatchNotes', variables],
      fetcher<GetDispatchNotesQuery, GetDispatchNotesQueryVariables>(GetDispatchNotesDocument, variables),
      options
    );
export const InsertDispatchNoteDocument = `
    mutation InsertDispatchNote($insertOptions: DispatchNoteInsertOptions!) {
  insertDispatchNote(options: $insertOptions) {
    ...DispatchNoteParts
  }
}
    ${DispatchNotePartsFragmentDoc}`;
export const useInsertDispatchNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertDispatchNoteMutation, TError, InsertDispatchNoteMutationVariables, TContext>) =>
    useMutation<InsertDispatchNoteMutation, TError, InsertDispatchNoteMutationVariables, TContext>(
      ['InsertDispatchNote'],
      (variables?: InsertDispatchNoteMutationVariables) => fetcher<InsertDispatchNoteMutation, InsertDispatchNoteMutationVariables>(InsertDispatchNoteDocument, variables)(),
      options
    );
export const UpdateDispatchNoteDocument = `
    mutation UpdateDispatchNote($updateOptions: DispatchNoteUpdateOptions!) {
  updateDispatchNote(options: $updateOptions) {
    ...DispatchNoteParts
  }
}
    ${DispatchNotePartsFragmentDoc}`;
export const useUpdateDispatchNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateDispatchNoteMutation, TError, UpdateDispatchNoteMutationVariables, TContext>) =>
    useMutation<UpdateDispatchNoteMutation, TError, UpdateDispatchNoteMutationVariables, TContext>(
      ['UpdateDispatchNote'],
      (variables?: UpdateDispatchNoteMutationVariables) => fetcher<UpdateDispatchNoteMutation, UpdateDispatchNoteMutationVariables>(UpdateDispatchNoteDocument, variables)(),
      options
    );
export const DeleteDispatchNoteDocument = `
    mutation DeleteDispatchNote($deleteOptions: DeleteOptions!) {
  deleteDispatchNote(options: $deleteOptions) {
    numRows
  }
}
    `;
export const useDeleteDispatchNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteDispatchNoteMutation, TError, DeleteDispatchNoteMutationVariables, TContext>) =>
    useMutation<DeleteDispatchNoteMutation, TError, DeleteDispatchNoteMutationVariables, TContext>(
      ['DeleteDispatchNote'],
      (variables?: DeleteDispatchNoteMutationVariables) => fetcher<DeleteDispatchNoteMutation, DeleteDispatchNoteMutationVariables>(DeleteDispatchNoteDocument, variables)(),
      options
    );
export const GetDispatchNotesArticlesDocument = `
    query GetDispatchNotesArticles($options: DispatchNoteArticleFetchOptions!) {
  dispatchNoteArticles(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...DispatchNoteArticleParts
    }
  }
}
    ${DispatchNoteArticlePartsFragmentDoc}
${WeightTypePartsFragmentDoc}`;
export const useGetDispatchNotesArticlesQuery = <
      TData = GetDispatchNotesArticlesQuery,
      TError = unknown
    >(
      variables: GetDispatchNotesArticlesQueryVariables,
      options?: UseQueryOptions<GetDispatchNotesArticlesQuery, TError, TData>
    ) =>
    useQuery<GetDispatchNotesArticlesQuery, TError, TData>(
      ['GetDispatchNotesArticles', variables],
      fetcher<GetDispatchNotesArticlesQuery, GetDispatchNotesArticlesQueryVariables>(GetDispatchNotesArticlesDocument, variables),
      options
    );
export const InsertDispatchNoteArticleDocument = `
    mutation InsertDispatchNoteArticle($insertOptions: DispatchNoteArticleInsertOptions!) {
  insertDispatchNoteArticle(options: $insertOptions) {
    ...DispatchNoteArticleParts
  }
}
    ${DispatchNoteArticlePartsFragmentDoc}
${WeightTypePartsFragmentDoc}`;
export const useInsertDispatchNoteArticleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertDispatchNoteArticleMutation, TError, InsertDispatchNoteArticleMutationVariables, TContext>) =>
    useMutation<InsertDispatchNoteArticleMutation, TError, InsertDispatchNoteArticleMutationVariables, TContext>(
      ['InsertDispatchNoteArticle'],
      (variables?: InsertDispatchNoteArticleMutationVariables) => fetcher<InsertDispatchNoteArticleMutation, InsertDispatchNoteArticleMutationVariables>(InsertDispatchNoteArticleDocument, variables)(),
      options
    );
export const UpdateDispatchNoteArticleDocument = `
    mutation UpdateDispatchNoteArticle($updateOptions: DispatchNoteArticleUpdateOptions!) {
  updateDispatchNoteArticle(options: $updateOptions) {
    ...DispatchNoteArticleParts
  }
}
    ${DispatchNoteArticlePartsFragmentDoc}
${WeightTypePartsFragmentDoc}`;
export const useUpdateDispatchNoteArticleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateDispatchNoteArticleMutation, TError, UpdateDispatchNoteArticleMutationVariables, TContext>) =>
    useMutation<UpdateDispatchNoteArticleMutation, TError, UpdateDispatchNoteArticleMutationVariables, TContext>(
      ['UpdateDispatchNoteArticle'],
      (variables?: UpdateDispatchNoteArticleMutationVariables) => fetcher<UpdateDispatchNoteArticleMutation, UpdateDispatchNoteArticleMutationVariables>(UpdateDispatchNoteArticleDocument, variables)(),
      options
    );
export const DeleteDispatchNoteArticleDocument = `
    mutation DeleteDispatchNoteArticle($deleteOptions: DeleteOptions!) {
  deleteDispatchNoteArticle(options: $deleteOptions) {
    numRows
  }
}
    `;
export const useDeleteDispatchNoteArticleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteDispatchNoteArticleMutation, TError, DeleteDispatchNoteArticleMutationVariables, TContext>) =>
    useMutation<DeleteDispatchNoteArticleMutation, TError, DeleteDispatchNoteArticleMutationVariables, TContext>(
      ['DeleteDispatchNoteArticle'],
      (variables?: DeleteDispatchNoteArticleMutationVariables) => fetcher<DeleteDispatchNoteArticleMutation, DeleteDispatchNoteArticleMutationVariables>(DeleteDispatchNoteArticleDocument, variables)(),
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
${WeightTypePartsFragmentDoc}
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
${WeightTypePartsFragmentDoc}
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
    mutation InsertEntry($insertOptions: EntryInsertOptions!) {
  insertEntry(options: $insertOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}
${WeightTypePartsFragmentDoc}
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
    mutation UpdateEntry($updateOptions: EntryUpdateOptions!) {
  updateEntry(options: $updateOptions) {
    ...EntryParts
  }
}
    ${EntryPartsFragmentDoc}
${WeightTypePartsFragmentDoc}
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
    mutation DeleteEntry($deleteOptions: DeleteOptions!) {
  deleteEntry(options: $deleteOptions) {
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
export const GetMbeGroupsDocument = `
    query GetMbeGroups {
  mbeGroups {
    id
    name
    owner
    createdAt
  }
}
    `;
export const useGetMbeGroupsQuery = <
      TData = GetMbeGroupsQuery,
      TError = unknown
    >(
      variables?: GetMbeGroupsQueryVariables,
      options?: UseQueryOptions<GetMbeGroupsQuery, TError, TData>
    ) =>
    useQuery<GetMbeGroupsQuery, TError, TData>(
      variables === undefined ? ['GetMbeGroups'] : ['GetMbeGroups', variables],
      fetcher<GetMbeGroupsQuery, GetMbeGroupsQueryVariables>(GetMbeGroupsDocument, variables),
      options
    );
export const GetGroupMembersDocument = `
    query GetGroupMembers($options: MbeGroupMembersQueryOptions!) {
  mbeGroupMembers(options: $options) {
    idUser
    email
    idGroup
    groupName
  }
}
    `;
export const useGetGroupMembersQuery = <
      TData = GetGroupMembersQuery,
      TError = unknown
    >(
      variables: GetGroupMembersQueryVariables,
      options?: UseQueryOptions<GetGroupMembersQuery, TError, TData>
    ) =>
    useQuery<GetGroupMembersQuery, TError, TData>(
      ['GetGroupMembers', variables],
      fetcher<GetGroupMembersQuery, GetGroupMembersQueryVariables>(GetGroupMembersDocument, variables),
      options
    );
export const InsertMbeGroupDocument = `
    mutation InsertMbeGroup($options: MbeGroupInsertOptions!) {
  insertMbeGroup(options: $options) {
    id
    name
    owner
    createdAt
  }
}
    `;
export const useInsertMbeGroupMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertMbeGroupMutation, TError, InsertMbeGroupMutationVariables, TContext>) =>
    useMutation<InsertMbeGroupMutation, TError, InsertMbeGroupMutationVariables, TContext>(
      ['InsertMbeGroup'],
      (variables?: InsertMbeGroupMutationVariables) => fetcher<InsertMbeGroupMutation, InsertMbeGroupMutationVariables>(InsertMbeGroupDocument, variables)(),
      options
    );
export const InsertMbeGroupMemberDocument = `
    mutation InsertMbeGroupMember($options: MbeGroupMembersOptions!) {
  insertGroupMember(options: $options) {
    idMbeUser
    idMbeGroup
  }
}
    `;
export const useInsertMbeGroupMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertMbeGroupMemberMutation, TError, InsertMbeGroupMemberMutationVariables, TContext>) =>
    useMutation<InsertMbeGroupMemberMutation, TError, InsertMbeGroupMemberMutationVariables, TContext>(
      ['InsertMbeGroupMember'],
      (variables?: InsertMbeGroupMemberMutationVariables) => fetcher<InsertMbeGroupMemberMutation, InsertMbeGroupMemberMutationVariables>(InsertMbeGroupMemberDocument, variables)(),
      options
    );
export const RemoveMbeGroupMemberDocument = `
    mutation RemoveMbeGroupMember($options: MbeGroupMembersOptions!) {
  removeGroupMember(options: $options) {
    numRows
  }
}
    `;
export const useRemoveMbeGroupMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveMbeGroupMemberMutation, TError, RemoveMbeGroupMemberMutationVariables, TContext>) =>
    useMutation<RemoveMbeGroupMemberMutation, TError, RemoveMbeGroupMemberMutationVariables, TContext>(
      ['RemoveMbeGroupMember'],
      (variables?: RemoveMbeGroupMemberMutationVariables) => fetcher<RemoveMbeGroupMemberMutation, RemoveMbeGroupMemberMutationVariables>(RemoveMbeGroupMemberDocument, variables)(),
      options
    );
export const InsertUserDocument = `
    mutation InsertUser($options: MbeUserInsertOptions!) {
  insertMbeUser(options: $options) {
    id
    email
    createdAt
  }
}
    `;
export const useInsertUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertUserMutation, TError, InsertUserMutationVariables, TContext>) =>
    useMutation<InsertUserMutation, TError, InsertUserMutationVariables, TContext>(
      ['InsertUser'],
      (variables?: InsertUserMutationVariables) => fetcher<InsertUserMutation, InsertUserMutationVariables>(InsertUserDocument, variables)(),
      options
    );
export const GetWeightTypesDocument = `
    query GetWeightTypes($options: WeightTypeFetchOptions!) {
  weightTypes(options: $options) {
    page
    pageSize
    totalItems
    totalPages
    results {
      ...WeightTypeParts
    }
  }
}
    ${WeightTypePartsFragmentDoc}`;
export const useGetWeightTypesQuery = <
      TData = GetWeightTypesQuery,
      TError = unknown
    >(
      variables: GetWeightTypesQueryVariables,
      options?: UseQueryOptions<GetWeightTypesQuery, TError, TData>
    ) =>
    useQuery<GetWeightTypesQuery, TError, TData>(
      ['GetWeightTypes', variables],
      fetcher<GetWeightTypesQuery, GetWeightTypesQueryVariables>(GetWeightTypesDocument, variables),
      options
    );
export const InsertWeightTypeDocument = `
    mutation InsertWeightType($options: WeightTypeInsertOptions!) {
  insertWeightTypes(options: $options) {
    ...WeightTypeParts
  }
}
    ${WeightTypePartsFragmentDoc}`;
export const useInsertWeightTypeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertWeightTypeMutation, TError, InsertWeightTypeMutationVariables, TContext>) =>
    useMutation<InsertWeightTypeMutation, TError, InsertWeightTypeMutationVariables, TContext>(
      ['InsertWeightType'],
      (variables?: InsertWeightTypeMutationVariables) => fetcher<InsertWeightTypeMutation, InsertWeightTypeMutationVariables>(InsertWeightTypeDocument, variables)(),
      options
    );
export const UpdateWeightTypesDocument = `
    mutation UpdateWeightTypes($options: WeightTypeUpdateOptions!) {
  updateWeightTypes(options: $options) {
    ...WeightTypeParts
  }
}
    ${WeightTypePartsFragmentDoc}`;
export const useUpdateWeightTypesMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateWeightTypesMutation, TError, UpdateWeightTypesMutationVariables, TContext>) =>
    useMutation<UpdateWeightTypesMutation, TError, UpdateWeightTypesMutationVariables, TContext>(
      ['UpdateWeightTypes'],
      (variables?: UpdateWeightTypesMutationVariables) => fetcher<UpdateWeightTypesMutation, UpdateWeightTypesMutationVariables>(UpdateWeightTypesDocument, variables)(),
      options
    );
export const DeleteWeightTypesDocument = `
    mutation DeleteWeightTypes($options: DeleteOptionsWeightType!) {
  deleteWeightTypes(options: $options) {
    numRows
  }
}
    `;
export const useDeleteWeightTypesMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteWeightTypesMutation, TError, DeleteWeightTypesMutationVariables, TContext>) =>
    useMutation<DeleteWeightTypesMutation, TError, DeleteWeightTypesMutationVariables, TContext>(
      ['DeleteWeightTypes'],
      (variables?: DeleteWeightTypesMutationVariables) => fetcher<DeleteWeightTypesMutation, DeleteWeightTypesMutationVariables>(DeleteWeightTypesDocument, variables)(),
      options
    );