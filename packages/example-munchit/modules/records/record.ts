import { Knex } from "../db";
import * as DataLoader from "dataloader";

import keyBy from "lodash-es/keyBy";
import groupBy from "lodash-es/groupBy";
import { Flavor } from "helpers";

/** This type is just a number representing a database ID that tracks the type of the source. */
export type NumberId<T> = Flavor<number, T>;
/** This type is just a string representing a database ID that tracks the type of the source. */
export type StringId<T> = Flavor<string, T>;

export interface RecordInfo<Unsaved, Saved, Id extends keyof Saved> {
  _saved: Saved;
  _unsaved: Unsaved;
  idKey: Id;
  tableName: string;
}

/** Creates a record descriptor that captures the table name, primary key name, unsaved type, and saved type of a database record type. Assumes "id" as the primary key name */
export function recordInfo<Unsaved, Saved extends { id: any }>(
  tableName: string
): RecordInfo<Unsaved, Saved, "id">;

/** Creates a record descriptor that captures the table name, primary key name, unsaved type, and saved type of a database record type. */
export function recordInfo<Unsaved, Saved, Id extends keyof Saved>(
  tableName: string,
  idKey: Id
): RecordInfo<Unsaved, Saved, Id>;

/** Don't use this signature – be sure to provide unsaved and saved types. */
export function recordInfo(tableName: string, idKey?: string) {
  return { tableName, idKey: idKey || "id" } as any;
}
/** Extract the static type of a saved record from a RecordInfo */
export type SavedR<T extends { _saved: any }> = T["_saved"];
/** Extract the static type of a unsaved record from a RecordInfo */
export type UnsavedR<T extends { _unsaved: any }> = T["_unsaved"];
/** Extract the static ID key type (e.g. 'id') from a RecordInfo*/
export type IdKeyR<K extends { idKey: string }> = K["idKey"];
/** Extract the static type of the id of a record from a RecordInfo*/
export type IdTypeR<R extends RecordInfo<any, any, any>> = SavedR<R>[IdKeyR<R>];
/** Extract the runtime key name from a recordInfo */
export function idKeyOf<Id extends string>(recordInfo: { idKey: Id }) {
  return recordInfo.idKey;
}

class LoaderFactory<
  UnsavedDestType,
  SavedDestType,
  DestId extends keyof SavedDestType
> {
  constructor(
    private repo: RepositoryBase<UnsavedDestType, SavedDestType, DestId>
  ) {}
  findOneBy<K extends keyof SavedDestType>(targetKey: K) {
    return new DataLoader<
      SavedDestType[K],
      SavedDestType | null
    >(async keyValues => {
      const entries: SavedDestType[] = await this.repo
        .table()
        .whereIn(targetKey, keyValues as any);
      const table = keyBy(entries, targetKey);
      return keyValues.map(val => table[val.toString()] || null);
    });
  }

  /** Analogous to has_many in Rails */
  allBelongingTo<
    UnsavedSourceT,
    SavedSourceT,
    SourceId extends keyof SavedSourceT,
    K extends keyof SavedDestType
  >(record: RecordInfo<UnsavedSourceT, SavedSourceT, SourceId>, foreignKey: K) {
    type SourceRecord = SavedR<typeof record>;
    type IdType = IdTypeR<typeof record>;
    return new DataLoader<
      SourceRecord | IdType,
      SavedDestType[]
    >(async args => {
      const ids: IdType[] = args.map(
        arg =>
          typeof arg === "object"
            ? (arg as SourceRecord)[record.idKey] as IdType
            : arg
      );
      const records = await this.repo.table().whereIn(foreignKey, ids as any[]);
      const table = groupBy<SavedDestType>(records, foreignKey);
      const ordered = ids.map(id => table[(id as any).toString()] || []);
      return ordered;
    });
  }

  /** Analogous to has_one in Rails */
  oneBelongingTo<
    SourceRecordInfo extends RecordInfo<any, any, any>,
    ForeignKey extends keyof SavedDestType
  >(record: SourceRecordInfo, foreignKey: ForeignKey) {
    type SourceRecord = SavedR<typeof record>;
    type FkType = SavedDestType[ForeignKey];
    return new DataLoader<SourceRecord | FkType, SavedDestType>(async args => {
      const ids: FkType[] = args.map(
        arg =>
          typeof arg === "object"
            ? (arg as SourceRecord)[record.idKey] as FkType
            : arg
      );
      const records = await this.repo.table().whereIn(foreignKey, ids as any[]);
      const table = keyBy<SavedDestType>(records, foreignKey);
      const ordered = ids.map(id => table[(id as any).toString()]);
      return ordered;
    });
  }

  /** Analogous to belongs_to in Rails */
  owning<
    UnsavedSource,
    SavedSource,
    SourceIdKey extends keyof SavedSource,
    ForeignKey extends keyof SavedSource
  >(
    record: RecordInfo<UnsavedSource, SavedSource, SourceIdKey>,
    sourceKey: ForeignKey
  ) {
    type FkType = SavedSource[ForeignKey];
    return new DataLoader<SavedSource | FkType, SavedDestType>(async args => {
      const ids: FkType[] = args.map(
        arg =>
          typeof arg === "object"
            ? (arg as SavedSource)[sourceKey] as FkType
            : arg
      );
      const records = await this.repo
        .table()
        .whereIn(idKeyOf(record), ids as any[]);
      const table = keyBy<SavedDestType>(records, idKeyOf(record));
      const ordered = ids.map(id => table[(id as any).toString()]);
      return ordered;
    });
  }
}

/** Factory to construct a DataLoader for associations returning the destination type handled by the passed in repostory */
export function loaderOf<
  UnsavedDestType,
  SavedDestType,
  DestId extends keyof SavedDestType
>(repo: RepositoryBase<UnsavedDestType, SavedDestType, DestId>) {
  return new LoaderFactory<UnsavedDestType, SavedDestType, DestId>(repo);
}

abstract class TableHelpers<UnsavedR, SavedR, IdKeyT extends keyof SavedR> {
  abstract recordType: RecordInfo<UnsavedR, SavedR, IdKeyT>;
  protected abstract db: Knex;

  table() {
    return this.db.table(this.recordType.tableName);
  }

  prepToCreate(unsaved: UnsavedR): Partial<SavedR> {
    return unsaved as any;
  }

  async insert(unsaved: UnsavedR): Promise<SavedR> {
    const ids = await this.table().insert(
      this.prepToCreate(unsaved),
      idKeyOf(this.recordType)
    );
    return Object.assign({}, unsaved, { id: ids[0] }) as any;
  }

  async all(): Promise<SavedR[]> {
    return await this.table();
  }

  async count(): Promise<number> {
    return await this.table().count();
  }

  findById = new DataLoader<SavedR[IdKeyT], SavedR | undefined>(async ids => {
    const rows: SavedR[] = await this.table().whereIn("id", ids as any);
    const byId = keyBy(rows, "id");
    return ids.map(id => byId[id.toString()]);
  });
}

export interface RepositoryBase<U, S, Id extends keyof S>
  extends TableHelpers<U, S, Id> {
  readonly tableName: string;
}

export function RepositoryBase<U, S, Id extends keyof S>(
  recordType: RecordInfo<U, S, Id>
) {
  return class RepositoryBase extends TableHelpers<U, S, Id> {
    static readonly recordType = recordType;
    static readonly tableName = recordType.tableName;
    public readonly tableName: string;
    public readonly recordType = recordType;
    protected db: Knex;

    constructor(db: Knex) {
      super();
      this.db = db;
    }
  };
}
