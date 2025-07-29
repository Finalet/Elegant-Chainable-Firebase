var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/lib/FirestoreDocument.ts
import admin from "firebase-admin";
var FirestoreDocument = class _FirestoreDocument {
  constructor(documentPath, childNode) {
    this.ref = firestore().doc(documentPath);
    this.collection = this.ref.parent;
    Object.entries(childNode).forEach(([key, node]) => {
      if (typeof node === "object" && node !== null && "doc" in node) {
        const docClass = node.class || _FirestoreDocument;
        this[node.doc] = (id) => new docClass(`${documentPath}/${key}/${id}`, node);
      }
    });
  }
  fetch() {
    return __async(this, null, function* () {
      return (yield this.ref.get()).data();
    });
  }
};
var firestore = () => {
  if (admin.apps.length > 0) {
    return admin.app().firestore();
  }
  throw new Error("Firebase app is not initialized. Please initialize Firebase first.");
};
export {
  FirestoreDocument
};
