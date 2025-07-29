import { F as FirestoreSchema, a as FirestoreSchemaTypes, b as FirestoreDatabase } from '../index-D0sLLYd1.js';
export { c as FirestoreDocument } from '../index-D0sLLYd1.js';

declare function initializeDatabase<TSchema extends FirestoreSchema, TTypesMap extends FirestoreSchemaTypes>(schema: TSchema, types?: TTypesMap): FirestoreDatabase<TSchema, TTypesMap>;
declare function buildSchema<T extends FirestoreSchema>(schema: T): T;

export { buildSchema, initializeDatabase };
