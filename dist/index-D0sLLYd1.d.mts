type FirestoreSchema = {
    [key: string]: FirestoreSchemaNode;
};
type FirestoreSchemaNode = {
    doc: string;
    class?: ClassWrapper<FirestoreDocument<any>>;
    [key: string]: FirestoreSchemaNode | string | ClassWrapper<FirestoreDocument<any>> | undefined;
};
type ClassWrapper<T> = new (...args: any[]) => T;
type FirestoreSchemaTypes = Record<string, any>;
type Prev = [never, 0, 1, 2, 3, 4, 5, 6];
type ExtractDocNames<T, D extends Prev[number] = 6> = [D] extends [never] ? never : T extends object ? {
    [K in keyof T]: T[K] extends {
        doc: infer DocName extends string;
    } ? DocName | ExtractDocNames<Omit<T[K], "doc" | "class">, Prev[D]> : ExtractDocNames<T[K], Prev[D]>;
}[keyof T] : never;
type DefineDocumentData<TSchema, T extends Partial<Record<ExtractDocNames<TSchema>, any>>> = T;
type InferDocData<TNode, TTypesMap> = TNode extends {
    doc: infer D extends keyof TTypesMap;
} ? TTypesMap[D] : any;
type InferClassInstance<TNode extends FirestoreSchemaNode, TTypesMap extends FirestoreSchemaTypes> = TNode extends {
    class: ClassWrapper<infer C>;
} ? C extends FirestoreDocument<infer U> ? FirestoreDocument<InferDocData<TNode, TTypesMap>> & Omit<C, keyof FirestoreDocument<any>> : C : FirestoreDocument<InferDocData<TNode, TTypesMap>>;
type FirestoreAPI<TNode extends FirestoreSchemaNode, TTypesMap extends FirestoreSchemaTypes> = TNode extends {
    doc: infer DocName extends keyof TTypesMap;
} ? (id: string) => InferClassInstance<TNode, TTypesMap> & {
    [K in keyof TNode as K extends "doc" | "class" ? never : TNode[K] extends FirestoreSchemaNode ? TNode[K]["doc"] : never]: TNode[K] extends FirestoreSchemaNode ? FirestoreAPI<TNode[K], TTypesMap> : never;
} : never;
type FirestoreDatabase<TSchema extends FirestoreSchema, TTypesMap extends FirestoreSchemaTypes> = {
    [K in keyof TSchema as TSchema[K]["doc"] extends keyof TTypesMap ? TSchema[K]["doc"] : never]: FirestoreAPI<TSchema[K], TTypesMap>;
};

declare class FirestoreDocument<T> {
    ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
    collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
    constructor(documentPath: string, childNode: FirestoreSchemaNode);
    fetch(): Promise<T>;
}

export { type DefineDocumentData as D, type FirestoreSchema as F, type FirestoreSchemaTypes as a, type FirestoreDatabase as b, FirestoreDocument as c, type FirestoreSchemaNode as d };
