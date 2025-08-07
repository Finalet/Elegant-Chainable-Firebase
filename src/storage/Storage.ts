import admin from "firebase-admin";
import { StorageFile, StorageFolder } from "./StorageFileFolder";
import { StorageSchemaNode } from "./types";
import { FileDescriptor, FolderDescriptor, StorageDatabase, StorageSchema } from "./types/StorageTypes";

/**
 * Helper function for defining the Firebase Storage schema for a file.
 * @param path Relative path to the folder.
 * @param Class (Optional) A Class that inherits StorageFolder. Used this to repalce the default class with your own to extend functionality as needed.
 * @param children (Optional) Schema for child files that this folder contains.
 */
export function folder<T extends Record<string, StorageSchemaNode>>(path: string): FolderDescriptor<StorageFolder, T>;
export function folder<T extends Record<string, StorageSchemaNode>>(path: string, children: T): FolderDescriptor<StorageFolder, T>;
export function folder<T extends Record<string, StorageSchemaNode>, C extends StorageFolder>(path: string, Class: new (app: admin.app.App, path: string, ...args: any[]) => C, children: T): FolderDescriptor<C, T>;
export function folder<T extends Record<string, StorageSchemaNode>, C extends StorageFolder>(path: string, ClassOrChildren?: (new (app: admin.app.App, path: string, ...args: any[]) => C) | T, maybeChildren?: T): FolderDescriptor<C, T> {
  let Class: new (...args: any[]) => C = StorageFolder as any;
  let children: T | undefined;

  if (typeof ClassOrChildren === "function") {
    Class = ClassOrChildren;
    children = maybeChildren ?? ({} as T);
  } else {
    children = ClassOrChildren ?? ({} as T);
  }

  return {
    __type: "folder",
    path,
    class: Class,
    children,
  } as any;
}

/**
 * Helper function for defining the Firebase Storage schema for a folder.
 * @param path Relative path to the file.
 * @param Class (Optional) A Class that inherits StorageFile. Used this to repalce the default class with your own to extend functionality as needed.
 * @returns
 */
export function file<T extends StorageFile>(path: string, Class: new (app: admin.app.App, path: string, ...args: any[]) => T = StorageFile as any): FileDescriptor {
  return {
    __type: "file",
    path,
    class: Class,
  };
}

function processNode(app: admin.app.App, node: StorageSchemaNode, parentPath: string) {
  if (typeof node === "function") {
    return (path: string) => {
      return processDescriptor(app, node(path), parentPath);
    };
  } else {
    return processFolderDescriptor(app, node, parentPath);
  }
}

function processFolderDescriptor(app: admin.app.App, descriptor: FolderDescriptor<StorageFolder, Record<string, StorageSchemaNode>>, parentPath: string): StorageFolder {
  const fullPath = normalizePath(`${parentPath}/${descriptor.path}`);
  const folder = new descriptor.class(app, fullPath);
  if (descriptor.children) {
    for (const key in descriptor.children) {
      (folder as any)[key] = processNode(app, descriptor.children[key], fullPath);
    }
  }
  return folder;
}

function processFileDescriptor(app: admin.app.App, descriptor: FileDescriptor, parentPath: string): StorageFile {
  const fullPath = normalizePath(`${parentPath}/${descriptor.path}`);
  return new descriptor.class(app, fullPath);
}

function processDescriptor(app: admin.app.App, descriptor: FileDescriptor | FolderDescriptor<StorageFolder, Record<string, StorageSchemaNode>>, parentPath: string) {
  if (descriptor.__type === "folder") {
    return processFolderDescriptor(app, descriptor, parentPath);
  } else {
    return processFileDescriptor(app, descriptor, parentPath);
  }
}

function normalizePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

/**
 * Helper function to define the Firebase Storage schema.
 * @param schema Your schema.
 * @returns A properly typed schema.
 */
export function buildStorageSchema<T extends StorageSchema>(schema: T) {
  return schema;
}

/**
 * Initializes chainable Firebase Storage database using provided schema.
 * @param schema Your Firebase Storage schema.
 * @returns An object for accessing Firebase Storage.
 */
export function initializeStorage<T extends StorageSchema>(app: admin.app.App, schema: T): StorageDatabase<T> {
  const result = {} as StorageDatabase<T>;
  for (const key in schema) {
    result[key] = processNode(app, schema[key], "") as StorageDatabase<T>[typeof key];
  }
  return result;
}
