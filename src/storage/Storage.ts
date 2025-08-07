import { StorageFile, StorageFolder } from "./StorageFileFolder";
import { StorageSchema, StorageSchemaNode } from "./types/StorageTypes";

/**
 * Helper function for defining the Firebase Storage schema for a file.
 * @param path Relative path to the folder.
 * @param Class (Optional) A Class that inherits StorageFolder. Used this to repalce the default class with your own to extend functionality as needed.
 * @param children (Optional) Schema for child files that this folder contains.
 */
export function folder<T extends Record<string, StorageSchemaNode>>(path: string, children?: T): StorageFolder & T;
export function folder<T extends Record<string, StorageSchemaNode>, C extends StorageFolder>(path: string, Class: new (...args: any[]) => C, children?: T): C & T;
export function folder<T extends Record<string, StorageSchemaNode>, C extends StorageFolder>(path: string, ClassOrChildren?: (new (...args: any[]) => C) | T, maybeChildren?: T): C & T {
  let Class: new (...args: any[]) => C = StorageFolder as any;
  let children: T | undefined;

  if (typeof ClassOrChildren === "function") {
    Class = ClassOrChildren;
    children = maybeChildren;
  } else {
    children = ClassOrChildren;
  }

  const folder = new Class(path);
  Object.assign(folder, children);
  return folder as C & T;
}

/**
 * Helper function for defining the Firebase Storage schema for a folder.
 * @param path Relative path to the file.
 * @param Class (Optional) A Class that inherits StorageFile. Used this to repalce the default class with your own to extend functionality as needed.
 * @returns
 */
export function file<T extends StorageFile>(path: string, Class: new (...args: any[]) => T = StorageFile as any) {
  return new Class(path);
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
export function initializeStorage<TSchema extends StorageSchema>(schema: TSchema): TSchema {
  const result: TSchema = {} as TSchema;
  for (const key in schema) {
    result[key] = processNode(schema[key], "") as TSchema[typeof key];
  }
  return result as TSchema;
}

function processNode(node: StorageSchemaNode, parentPath: string): StorageSchemaNode {
  if (typeof node === "function") {
    return (path: string) => {
      const result = node(path);
      result.path = normalizePath(`${parentPath}/${result.path}`);
      if (result instanceof StorageFolder) {
        processFolder(result, result.path);
      }
      return result;
    };
  } else if (node instanceof StorageFolder) {
    node.path = normalizePath(`${parentPath}/${node.path}`);
    processFolder(node, node.path);
    return node;
  } else if (typeof node === "object") {
    const newObj: Record<string, StorageSchemaNode> = {};
    for (const key in node) {
      newObj[key] = processNode(node[key], parentPath);
    }
    return newObj;
  } else {
    return node;
  }
}

function processFolder(folder: StorageFolder, currentPath: string) {
  for (const key of Object.keys(folder)) {
    const child = (folder as any)[key];
    const processedChild = processNode(child, currentPath);
    (folder as any)[key] = processedChild;
  }
}

function normalizePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/\/$/, ""); // collapse slashes and remove trailing
}
