import { F as FirestoreSchema, a as FirestoreSchemaTypes, b as FirestoreDatabase } from './index-Cg8C1Gg_.mjs';
export { D as DefineDocumentTypes, c as FirestoreDocument } from './index-Cg8C1Gg_.mjs';

declare function initializeDatabase<TSchema extends FirestoreSchema, TTypesMap extends FirestoreSchemaTypes>(schema: TSchema, types?: TTypesMap): FirestoreDatabase<TSchema, TTypesMap>;
declare function buildSchema<T extends FirestoreSchema>(schema: T): T;

export { buildSchema, initializeDatabase };
