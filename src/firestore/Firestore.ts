import { FirestoreDocument } from "./FirestoreDocument";
import { FirestoreDatabase, FirestoreSchema, FirestoreSchemaNode, FirestoreSchemaTypes } from "./types/FirestoreTypes";
import admin from "firebase-admin";

/**
 * Initializes a chainable Firestore database using the provided schema.
 *
 * @param app: Instance of the Firebase Admin SDK.
 * @param schema The schema object describing your Firestore collections and their document types.
 * @param types (Optional) Should be an empty object of type that inherits FirestoreSchemaTypes. Used to provide interface definitions to your schema.
 * @returns An object for accessing the Firestore database.
 *
 * @example
 * const schema = buildFirestoreSchema({
 *   users: {
 *     doc: "user",
 *   },
 * } as const);
 *
 * const db = initializeFirestore(schema);
 * const userDoc = db.user("userId").fetch();
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function initializeFirestore<TSchema extends FirestoreSchema, TTypesMap extends FirestoreSchemaTypes>(app: admin.app.App, schema: TSchema, types?: TTypesMap): FirestoreDatabase<TSchema, TTypesMap> {
  const api: any = {};
  Object.entries(schema).forEach(([key, node]) => {
    if (typeof node === "object" && node !== null && "doc" in node) {
      const docClass = node.class || FirestoreDocument;
      api[node.doc] = (id: string | null) => new docClass(app, `${key}/${id}`, node as FirestoreSchemaNode);
    }
  });
  return api;
}

/**
 * Helper function to write the Firestore database schema.
 * @param schema Your Firestore schema. You should always end it with `as const` to make sure typescript properly parses the schema.
 * @returns Properly typed Firestore schema.
 *
 * @example
 * const schema = buildFirestoreSchema({
 *   users: {
 *     doc: "user",
 *   },
 * } as const);
 */
export function buildFirestoreSchema<T extends FirestoreSchema>(schema: T) {
  return schema;
}
