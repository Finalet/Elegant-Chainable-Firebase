import admin from "firebase-admin";
import { StorageFile, StorageFolder } from "../StorageFileFolder";

export type StorageSchema = {
  [key: string]: StorageSchemaNode;
};

export type StorageSchemaNode = ((path: string) => FileDescriptor | FolderDescriptor<any, any>) | FolderDescriptor<any, any>;

export type FolderDescriptor<Class extends StorageFolder, Children extends Record<string, StorageSchemaNode>> = {
  __type: "folder";
  path: string;
  class: new (app: admin.app.App, path: string, ...args: any[]) => Class;
  children: Children;
};

export type FileDescriptor = {
  __type: "file";
  path: string;
  class: new (app: admin.app.App, path: string, ...args: any[]) => StorageFile;
};

type UpwrapFileDescriptor<T extends FileDescriptor> = InstanceType<T["class"]>;
type UnwrapFolderDescriptor<T extends FolderDescriptor<any, any>> = InstanceType<T["class"]> & { [K in keyof T["children"]]: UnwrapSchemaNode<T["children"][K]> };
type Unwrap<T extends FileDescriptor | FolderDescriptor<any, any>> = T extends FileDescriptor ? UpwrapFileDescriptor<T> : T extends FolderDescriptor<any, any> ? UnwrapFolderDescriptor<T> : never;
type UnwrapFunction<T extends (path: string) => FileDescriptor | FolderDescriptor<any, any>> = (...arg: Parameters<T>) => Unwrap<ReturnType<T>>;
type UnwrapSchemaNode<T extends StorageSchemaNode> = T extends (path: string) => FileDescriptor | FolderDescriptor<any, any> ? UnwrapFunction<T> : T extends FolderDescriptor<any, any> ? UnwrapFolderDescriptor<T> : never;
type UnwrapSchema<T extends StorageSchema> = {
  [K in keyof T]: UnwrapSchemaNode<T[K]>;
};

export type StorageDatabase<T extends StorageSchema> = UnwrapSchema<T>;
