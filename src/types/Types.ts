import { FirestoreDocument } from "../lib/FirestoreDocument";

// --- SCHEMA DEFINITION ---
export type FirestoreSchema = {
  [key: string]: FirestoreSchemaNode;
};

export type FirestoreSchemaNode = {
  doc: string;
  class?: ClassWrapper<FirestoreDocument<any>>;
  [key: string]: FirestoreSchemaNode | string | ClassWrapper<FirestoreDocument<any>> | undefined;
};

type ClassWrapper<T> = new (...args: any[]) => T;

// --- SCHEMA TYPES DEFINITION ---

export type FirestoreSchemaTypes = Record<string, any>;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6];

type ExtractDocNames<T, D extends Prev[number] = 6> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]: T[K] extends { doc: infer DocName extends string } ? DocName | ExtractDocNames<Omit<T[K], "doc" | "class">, Prev[D]> : ExtractDocNames<T[K], Prev[D]>;
    }[keyof T]
  : never;

export type DefineDocumentTypes<TSchema, T extends Partial<Record<ExtractDocNames<TSchema>, any>>> = T;

// --- FIRESTORE DATABASE TYPE ---

type InferDocData<TNode, TTypesMap> = TNode extends { doc: infer D extends keyof TTypesMap } ? TTypesMap[D] : any;

type InferClassInstance<TNode extends FirestoreSchemaNode, TTypesMap extends FirestoreSchemaTypes> = TNode extends { class: ClassWrapper<infer C> }
  ? C extends FirestoreDocument<infer U> // eslint-disable-line @typescript-eslint/no-unused-vars
    ? FirestoreDocument<InferDocData<TNode, TTypesMap>> & Omit<C, keyof FirestoreDocument<any>>
    : C
  : FirestoreDocument<InferDocData<TNode, TTypesMap>>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FirestoreAPI<TNode extends FirestoreSchemaNode, TTypesMap extends FirestoreSchemaTypes> = TNode extends { doc: infer DocName extends keyof TTypesMap }
  ? (id: string) => InferClassInstance<TNode, TTypesMap> & {
      [K in keyof TNode as K extends "doc" | "class" ? never : TNode[K] extends FirestoreSchemaNode ? TNode[K]["doc"] : never]: TNode[K] extends FirestoreSchemaNode ? FirestoreAPI<TNode[K], TTypesMap> : never;
    }
  : never;

export type FirestoreDatabase<TSchema extends FirestoreSchema, TTypesMap extends FirestoreSchemaTypes> = {
  [K in keyof TSchema as TSchema[K]["doc"] extends keyof TTypesMap ? TSchema[K]["doc"] : never]: FirestoreAPI<TSchema[K], TTypesMap>;
};

// --- FirebaseDocument.updateField() types ---

// Type utility to extract the leaves of an object as a dot-separated string
type IsPlainObject<T> = T extends object ? (T extends Date ? false : T extends Array<any> ? false : true) : false;

type Leaves<T> = {
  [K in keyof T]: K extends string
    ? IsPlainObject<T[K]> extends true
      ?
          | K // include the object path itself
          | `${K}.${Leaves<T[K]>}` // and recurse for nested paths
      : K // primitive leaf
    : never;
}[keyof T];

type ExcludeUndefined<T> = T extends `${string}.undefined` | undefined ? never : T;

export type FieldsOf<T> = ExcludeUndefined<Leaves<T>>;

// Type utility to finding the correct value type of a path in an object
type Split<S extends string, D extends string = "."> = S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

type PathValueAtPath<T, Path extends string[]> = Path extends [infer Head, ...infer Rest] ? (Head extends keyof T ? (Rest extends string[] ? PathValueAtPath<T[Head], Rest> : never) : never) : T;

export type FieldTypeAtPath<T, P extends string> = PathValueAtPath<T, Split<P>>;
