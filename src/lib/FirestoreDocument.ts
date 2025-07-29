import admin from "firebase-admin";
import { FirestoreSchemaNode } from "../types/Types";

export class FirestoreDocument<T> {
  ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;

  constructor(documentPath: string, childNode: FirestoreSchemaNode) {
    this.ref = firestore().doc(documentPath);
    this.collection = this.ref.parent;

    Object.entries(childNode).forEach(([key, node]) => {
      if (typeof node === "object" && node !== null && "doc" in node) {
        const docClass = node.class || FirestoreDocument;
        (this as any)[node.doc] = (id: string) => new docClass(`${documentPath}/${key}/${id}`, node as FirestoreSchemaNode);
      }
    });
  }

  async fetch(): Promise<T> {
    return (await this.ref.get()).data() as T;
  }
}

const firestore = () => {
  if (admin.apps.length > 0) {
    return admin.app().firestore();
  }

  throw new Error("Firebase app is not initialized. Please initialize Firebase first.");
};
