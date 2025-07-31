import { FirestoreDocument } from "./FirestoreDocument";
import { FirestoreDatabase, FirestoreSchema, FirestoreSchemaNode, FirestoreSchemaTypes } from "../types/FirestoreTypes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function initializeFirestore<TSchema extends FirestoreSchema, TTypesMap extends FirestoreSchemaTypes>(schema: TSchema, types?: TTypesMap): FirestoreDatabase<TSchema, TTypesMap> {
  const api: any = {};
  Object.entries(schema).forEach(([key, node]) => {
    if (typeof node === "object" && node !== null && "doc" in node) {
      const docClass = node.class || FirestoreDocument;
      api[node.doc] = (id: string) => new docClass(`${key}/${id}`, node as FirestoreSchemaNode);
    }
  });
  return api;
}

export function buildFirestoreSchema<T extends FirestoreSchema>(schema: T) {
  return schema;
}
