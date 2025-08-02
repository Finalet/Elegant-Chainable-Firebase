import { StorageFile, StorageFolder } from "./StorageFile";
import { StorageSchema, StorageSchemaNode } from "./types/StorageTypes";

export const folder = <T extends Record<string, StorageSchemaNode>>(path: string, children?: T): StorageFolder & T => {
  const folder = new StorageFolder(path);
  Object.assign(folder, children);
  return folder as StorageFolder & T;
};

export const file = (path: string) => {
  return new StorageFile(path);
};

export function buildStorageSchema<T extends StorageSchema>(schema: T) {
  return schema;
}

export function initializeStorage<TSchema extends StorageSchema>(schema: TSchema): TSchema {
  const result: TSchema = {} as TSchema;
  for (const key in schema) {
    result[key] = processNode(schema[key], "") as TSchema[typeof key];
  }
  return result as TSchema;
}

function processNode(node: StorageSchemaNode, parentPath: string): StorageSchemaNode {
  if (typeof node === "function") {
    return (id: string) => {
      const result = node(id);
      if (result instanceof StorageFile) {
        result.path = normalizePath(`${parentPath}/${result.path}`);
      } else if (result instanceof StorageFolder) {
        result.path = normalizePath(`${parentPath}/${result.path}`);
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
