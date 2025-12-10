import admin from "firebase-admin";
import { DocumentReference, DocumentData, CollectionReference } from "firebase-admin/firestore";
import { FieldsOf, FieldTypeAtPath, FirestoreSchemaNode } from "./types/FirestoreTypes";

/**
 * Main class used to access and manipulate Firestore documents. Inherit this class to extend with custom functionality as needed.
 */
export class FirestoreDocument<T extends { [key: string]: any }> {
  ref: DocumentReference<DocumentData, DocumentData>;
  collection: CollectionReference<DocumentData, DocumentData>;

  constructor(public app: admin.app.App, documentPath: string, childNode: FirestoreSchemaNode) {
    this.ref = app.firestore().doc(documentPath);
    this.collection = this.ref.parent;

    this.buildClass(documentPath, childNode);
  }

  protected buildClass(documentPath: string, childNode: FirestoreSchemaNode) {
    Object.entries(childNode).forEach(([key, node]) => {
      if (typeof node === "object" && node !== null && "doc" in node) {
        const docClass = node.class || FirestoreDocument;
        (this as any)[node.doc] = (id: string) => new docClass(this.app, `${documentPath}/${key}/${id}`, node as FirestoreSchemaNode);
      }
    });
  }

  async fetch(): Promise<T> {
    const doc = await this.ref.get();
    return objectFromFirestoreDoc<T>(doc);
  }

  async fetchAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => objectFromFirestoreDoc<T>(doc));
  }

  async save(object: T) {
    await this.ref.set(object);
  }

  async delete(recursive: boolean = false) {
    if (recursive) this.app.firestore().recursiveDelete(this.ref);
    else await this.ref.delete();
  }

  async exists(): Promise<boolean> {
    const doc = await this.ref.get();
    return doc.exists;
  }

  async updateField<K extends FieldsOf<T>>(field: K, value: FieldTypeAtPath<T, K>, deleteIfEmpty: boolean = true, deleteEmptyParents: boolean = true) {
    const shouldDelete = !value || (Array.isArray(value) && value.length === 0) || (typeof value === "object" && Object.keys(value).length === 0);
    await this.ref.update({
      [field]: shouldDelete && deleteIfEmpty ? admin.firestore.FieldValue.delete() : value,
    });

    if (shouldDelete && deleteIfEmpty && deleteEmptyParents) {
      // Checking if after deletion the parent object is empty. If yes, delete it too.
      const pathSegments = field.split(".").slice(0, -1);
      for (let i = 0; i < pathSegments.length; i++) {
        const checkingPath = pathSegments.slice(0, pathSegments.length - i).join(".");
        const checkingData = (await this.ref.get()).get(checkingPath);
        if (checkingData && Object.keys(checkingData).length === 0) {
          await this.ref.update({
            [checkingPath]: admin.firestore.FieldValue.delete(),
          });
        } else {
          break;
        }
      }
    }
  }
}

export const objectFromFirestoreDoc = <T>(doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>): T => {
  if (!doc.exists) throw new Error(`Document at ${doc.ref.path} does not exist.`);
  const data = doc.data();
  if (!data) throw new Error(`Document at ${doc.ref.path} has no data.`);

  convertTimestampsToDates(data);
  return data as T;
};

function isFirestoreTimestamp(obj: any): obj is { _seconds: number; _nanoseconds: number } {
  return !!obj && typeof obj === "object" && "_seconds" in obj && "_nanoseconds" in obj && typeof obj._seconds === "number" && typeof obj._nanoseconds === "number";
}

function firestoreTimestampToDate(timestamp: { _seconds: number; _nanoseconds: number }) {
  return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
}
function convertTimestampsToDates(data: admin.firestore.DocumentData) {
  for (const key in data) {
    const value = data[key];

    if (isFirestoreTimestamp(value)) {
      data[key] = firestoreTimestampToDate(value);
    } else if (typeof value === "object" && value !== null) {
      convertTimestampsToDates(value);
    }
  }
}
