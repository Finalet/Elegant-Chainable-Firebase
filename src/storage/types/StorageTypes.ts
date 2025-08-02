import { StorageFile, StorageFolder } from "../StorageFile";

export type StorageDatabase = StorageSchema;
export type StorageSchema = {
  [key: string]: StorageSchemaNode;
};
export type StorageSchemaNode = ((id: string) => StorageFile | StorageFolder) | StorageFolder | { [key: string]: StorageSchemaNode };
