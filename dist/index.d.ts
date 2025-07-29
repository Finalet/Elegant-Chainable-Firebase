type FirestoreSchemaNode = {
    doc: string;
    class?: ClassWrapper<FirestoreDocument<any>>;
    [key: string]: FirestoreSchemaNode | string | ClassWrapper<FirestoreDocument<any>> | undefined;
};
type ClassWrapper<T> = new (...args: any[]) => T;

declare class FirestoreDocument<T> {
    ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
    collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
    constructor(documentPath: string, childNode: FirestoreSchemaNode);
    fetch(): Promise<T>;
}

export { FirestoreDocument };
