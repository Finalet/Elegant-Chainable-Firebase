# Elegant Chainable Firebase

Tired of manually typing your Firestore document paths, like `"users/${userID}/articles/${articleID}"`? Who even thought this would be a good idea? One typo and database no workie too much.

Behold: ✨ `elegant-chainable-firebase` ✨. Define your Firebase schema and enjoy a fully safe, typed, and infinitely extendable access to your database.

## 📢 Need a press kit or a landing page?

Try [Pressdeck](https://pressdeck.io/?utm_source=elegant_chainable_firebase). Get media coverage for your products with a professional press kit website made in minutes.

## 🤔 About

Elegant Chainable Firebase 🫦🥵💦 is a Firebase Admin SDK wrapper that removes the hasle of manually typing and keeping track of your Firestore collections and documents. Elegant Chainable Firebase provides a simple, chainable, fully typed API with convenient access to manipulate your data.

1. [Installation](#-installation)
2. [Quick Start](#-quick-start)
3. [Firestore Usage](#-firestore-usage)
    1. [Define Firestore schema](#1-define-firestore-schema)
    2. [Provide TypeScript document types](#2-provide-typescript-document-definitions)
    3. [Initialize Firestore database](#3-initialize-firestore-database)
    4. [Use Firestore database](#4-use-firestore-database)
    5. [Extend Firestore functionality](#5-extend-firestore-functionality)
4. [Storage Usage](#storage-usage)
    1. [Define schema](#1-define-storage-schema)
    2. [Initialize Storage database](#2-initialize-storage-database)
    3. [Use Storage database](#3-use-storage-database)
    4. [Extend Storage functionality](#4-extend-storage-functionality)


## 💻 Installation

What do you expect from this section? If you use `npm`, run this line. Otherwise... idk, tough luck I guess.

```bash
npm i elegant-chainable-firebase
```

## 🏁 Quick Start

I know you can't handle reading this whole guide, so I pilled it all up into this one chunk of code. So gracious.

```typescript
import { buildFirestoreSchema, initializeFirestore, DefineDocumentTypes } from "elegant-chainable-firebase/firestore";
import admin from "firebase-admin";

const app = admin.initializeApp(); // Your instance of the Firebase Admin SDK

const schema = buildFirestoreSchema({
  users: {
    doc: "user",
  },
} as const);

type DocumentDefinitions = DefineDocumentTypes<typeof schema, {
  user: User;
}>;

const firestore = initializeFirestore(app, schema, {} as DocumentDefinitions);
```

No idea how it works? Keep on readin', buddy.

## 👀 Firestore Usage

### 1. Define Firestore schema

Firstly, you need to define a Firestore schema. This is the layout of your database and the only place where you should be manually writing collection names.

Imagine, you have the following Firestore setup:

```
users (collection)
└── {userID} (document)
    └── tasks (sub-collection)
        └── {taskID} (document)
```

Use `buildFirestoreSchema` helper function to construct your schema with IntelliSense suggestions and TypeScript safety.

```typescript
import { buildFirestoreSchema } from "elegant-chainable-firebase/firestore";

const schema = buildFirestoreSchema({
  users: {          // collection name
    doc: "user",    // convenient name to access documents in this collection
    tasks: {
      doc: "task",
    },
  },
} as const);
```

Notice, how the collections are `users` and `tasks`, but we also set their keys `doc` to `user` and `task` respectively. Why? To make life harder developing this library, of course. Coincidentally, this creates a more intuitive interface to interact with Firestore.

Because of it, you are able to access your documents using singular language, which makes more sense:

```typescript
// Fetches document at `users/${userID}`
const user = await firestore.user(userID).fetch();

// Fetches document at `users/${userID}/tasks/${taskID}`
const task = await firestore.user(userID).task(taskID).fetch();
```

> **🫦 Lessons learned:** Schema keys represent collection names, while their child key `doc` defines a convenient name to access documents in this collection.

### 2. Provide TypeScript document definitions

Imagine fetching your data and getting fucking `DocumentSnapshot<DocumentData, DocumentData>` in return? Imagine that you also need to run `docSnapshot.data()` afterwards to get the actuall data? Literally psychotic.

If only you could get the document data with the exact TypeScript interface representation in just one call...

Define a new TypeScript type listing your documents with their corresponding interfaces. I even created a cute little helper type you can extend, `DefineDocumentTypes`, which will provide IntelliSense suggestions from your schema!

```typescript
import { DefineDocumentTypes } from "elegant-chainable-firebase/firestore";

const schema = buildFirestoreSchema(...)

type DocumentDefinitions = DefineDocumentTypes<typeof schema, {
  user: User,
  task: Task,
}>;
```

Now, simply pass an **empty object of this type** (diabolical, I know) to `initializeFirestore` and the database will be fully aware of the objects within it!

```typescript
const firestore = initializeFirestore(app, schema, {} as DocumentDefinitions);

// Returns an object of type `User`
const user: User = firestore.user(userID).fetch();

// updateField() now only accepts available fields inside `Task`
const task: Task = firestore.user(userID).task(taskID).updateField("name");
```

Notice, that every key in `DocumentDefinitions` correspond to the names of each `doc` in the schema. This is important and makes sense.

> **🫦 Lessons learned:** Google developers are mental, jump-scaring us with `DocumentSnapshot` when we just need the data. Use `DefineDocumentTypes` to safely declare types for your documents.

### 3. Initialize Firestore database

Finally, bazinga! Simply pass your schema and type definitions to `initializeFirestore` alongside your Firebase Admin SDK app instance: in the stuff goes, out the API comes.

```typescript
import { initializeFirestore, DefineDocumentTypes } from "elegant-chainable-firebase/firestore";
import admin from "firebase-admin";

const app = admin.initializeApp();

const schema = buildFirestoreSchema(...)
type DocumentDefinitions = DefineDocumentTypes<typeof schema, ...>

const firestore = initializeFirestore(app, schema, {} as DocumentDefinitions);
```

### 4. Use Firestore database

```typescript
// Fetch a properly typed user document
const user: User = await firestore.user(userID).fetch();

// Save a full user object
await firestore.user(userID).save(userData);

// Update only the user's name field to "Looser"
await firestore.user(userID).updateField("name", "Looser");

// Delete a user object
await firestore.user(userID).delete();

// Check if the user object exists
await firestore.user(userID).exists();
```

### 5. Extend Firestore functionality

Obviously, you are much cooler than me. So, you have methods that you need to perform safely on your data. Extend my `FirestoreDocument` class with your custom methods and include it in the schema as a `class` key.

```typescript
import { FirestoreDocument } from "elegant-chainable-firebase/firestore";

interface User {
  name: string;
  level: number;
  token: string;
}

class UserFirestoreDocument extends FirestoreDocument<User> {
  async levelUp(newLevel: number) {
    await this.updateField("level", newLevel);
  }

  async generateToken() {
    const token = MockCrypto.getToken();
    await this.updateField("token", token);
    return token;
  }
}

const schema = buildFirestoreSchema({
  users: {
    doc: "user",
    class: UserFirestoreDocument,
  },
} as const);
```

Now, your extended class will be used for the `user` documents. This is the recommended way of setting up Elegant Chainable Firebase. Having dedicated classes with custom methods manipulating data for each document is pretty cool.

```typescript
await firestore.user(userID).levelUp(420);
const token = await firestore.user(userID).generateToken();
```

> **🫦 Lessons learned:** Please, please, please, extend functionality of `FirestoreDocument` to craft the perfect API for your own use case.

## Storage Usage

### 1. Define Storage schema

Firstly, you need to define a Storage schema. This is the layout of your storage and the only place where you should be manually writing folder paths.

Imagine, you would like to create the following Storage structure:

```
users (folder)
└── {userID} (sub-folder)
    └── images (sub-folder)
        └── {fileName} (file)
```

To set up this structure in Elegant Chainable Firebase, use helper functions `folder()` and `file()` inside of `buildStorageSchema()`:

```typescript
import { buildStorageSchema, file, folder } from "elegant-chainable-firebase/storage";

const schema = buildStorageSchema({
  user: (userID: string) => folder(`users/${userID}`, {
    image: (fileName: string) => file(`/images/${fileName}`),
  }),
} as const);
```

Notice that paths inside `folder()` and `file()` are **relative** to their parent. So, the final storage path for the nested `file('/images/${fileName}')` would be `users/${userID}/images/${fileName}`

> **🫦 Lessons learned:** Use callbacks inside your Storage schema to create dynamic paths. All paths should be relative to their parent.

### 2. Initialize Storage database

Now, you can simply pass your storage schema, alongside the Firebase Admin SDK, to `initializeStorage()`. Hippity-hoppity, Firebase Storage is now your property.

```typescript
import { initializeStorage, buildStorageSchema } from "elegant-chainable-firebase/storage";
import admin from "firebase-admin"

const app = admin.initializeApp();

const schema = buildStorageSchema(...)
const Storage = initializeStorage(app, storageSchema);
```

### 3. Use Storage database

```typescript
// Upload file
await Storage.user(userID).image(fileName).upload(fileBuffer);

// Delete file
await Storage.user(userID).image(fileName).delete();

// Download file
await Storage.user(userID).image(fileName).download();

// Get download URL
await Storage.user(userID).image(fileName).getDownloadUrl();

// Get a unique file name for the specified file at a path
await Storage.user(userID).image(fileName).getUniqueFileName();

// Delete the whole user folder
await Storage.user(userID).delete();
```

### 4. Extend Storage functionality

Once again, I can only bow in light of your excellence: of course you want to have custom methods to manipulate your files!

So, your highness, extend the `StorageFile` and `StorageFolder` classes with your functionality and leave us peasants alone.

```typescript
class UserStorageFolder extends StorageFolder {
  async deleteTempFiles() {
    await this.subFolder(`temp`).delete();
  }
}

class UserStorageFile extends StorageFile {
  async uploadAvatar(file: File) {
    await this.file("avatar.png").upload(file);
  }
}
```