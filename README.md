# Elegant Chainable Firebase

Tired of manually typing your Firestore document paths, like `"users/${userID}/articles/${articleID}"`? Who even thought this would be a good idea? One typo and database no workie too much.

Behold: ✨ `elegant-chainable-firebase` ✨. Define your Firebase schema and enjoy a fully safe, typed, and infinitely extendable access to your database.

## 📢 Need a press kit or a landing page?

Try [Pressdeck](https://pressdeck.io/?utm_source=elegant_chainable_firebase). Get media coverage for your products with a professional press kit website made in minutes.

## 🤔 About

Elegant Chainable Firebase 🫦🥵👅💦 is a Firebase Admin SDK wrapper that removes the hasle of manually typing and keeping track of your Firestore collections and documents. Elegant Chainable Firebase provides a simple, chainable, fully typed API with convenient access to manipulate your data.

## 💻 Installation

What do you expect from this section? If you use `npm`, run this line. Otherwise... idk, tough luck I guess.

```bash
npm i elegant-chainable-firebase
```

## 🏁 Quick Start

Eager to start? I know you can't handle reading this whole guide, so I pilled it all up into this one code block. So gracious.

```javascript
import { buildFirestoreSchema, initializeFirestore, DefineDocumentTypes } from "elegant-chainable-firebase/firestore";
import admin from "firebase-admin";

const app = admin.initializeApp(); // Your instance of the Firebase Admin SDK

const schema = buildFirestoreSchema({
  users: {
    doc: "user",
  }
} as const);

type DocumentDefinitions = DefineDocumentTypes<typeof schema, {
  user: User;
}>;

const firestore = initializeFirestore(app, schema, {} as DocumentDefinitions);
```

No idea how it works? Keep on readin', buddy.

## 👀 Firestore Usage

### 1. Define schema

Firstly, you need to define a Firestore schema. This is the layout of your database and the only place where you should be manually writing collection names.

Imagine, you have the following Firestore setup:

```
users (collection)
└── {userID} (document)
    └── tasks (collection)
        └── {taskID} (document)
```

Use `buildFirestoreSchema` helper function to construct your schema with IntelliSense suggestions and TypeScript safety.

```javascript
import { buildFirestoreSchema } from "elegant-chainable-firebase/firestore";

const schema = buildFirestoreSchema({
  users: {            // collection name
    doc: "user",      // convenient name to access documents in this collection
    tasks: {
      doc: "task"
    }
  }
} as const);
```

Notice, how the collections are `users` and `tasks`, but we also set their keys `doc` to `user` and `task` respectively. Why? To make life harder for me to develop this library, of course. Coincidentally though, this creates a more intuitive interface to interact with Firestore.

Because of it, you are able to access your documents using singular language, which makes most sense:

```javascript
// Fetch document at `users/${userID}`
const user = await firestore.user(userID).fetch();

// Fetch document at `users/${userID}/tasks/${taskID}`
const task = await firestore.user(userID).task(taskID).fetch();
```

> **🤤 Lessons learned:** Schema keys represent collection names, while their child key `doc` defines a convenient name to access documents in this collection.

### 2. Provide document types

Imagine fetching your data and getting fucking `DocumentSnapshot<DocumentData, DocumentData>` in return? Imagine that you also need to run `docSnapshot.data()` afterwards to get the actuall data? Literally psychotic.

If only you could get the document data with the exact TypeScript interface representation in just one call... Well, now you can!

Define a new TypeScript type listing your documents with their corresponding interfaces. I even created a cute little type you can extends `DefineDocumentTypes` which will provide IntelliSense suggestions from your schema!

```javascript
import { DefineDocumentTypes } from "elegant-chainable-firebase/firestore";

const schema = buildFirestoreSchema(...)

type DocumentDefinitions = DefineDocumentTypes<typeof schema, {
    user: User,
    task: Task,
}>;
```

Now, simply pass an **empty object of this type** (little psychotic, I know) to `initializeFirestore` and the database will be fully aware of the objects within in!

```javascript
const firestore = initializeFirestore(app, schema, {} as DocumentDefinitions);

// Returns an object of type `User`
const user: User = firestore.user(userID).fetch()

// updateField() now only accepts available fields inside `Task`
const task: Task = firestore.user(userID).task(taskID).updateField("name")
```

Notice, that every key in our `DocumentDefinitions` type correspond to the names of each `doc` in our schema. This is important and makes sense.

> **🤤 Lessons learned:** Google developers are mental, jump scaring us with `DocumentSnapshot` when we just need the data. Use `DefineDocumentTypes` to safely declare types for your documents.

### 3. Initialize database

Finally, bazinga! Simply pass your schema and type definitions to `initializeFirestore` alongside your Firebase Admin SDK app instance: in the stuff goes, out the API comes.

```javascript
import { initializeFirestore, DefineDocumentTypes } from "elegant-chainable-firebase/firestore";
import admin from "firebase-admin";

const schema = buildFirestoreSchema(...)
type DocumentDefinitions = DefineDocumentTypes<typeof schema, ...>
const app = admin.initializeApp();

const firestore = initializeFirestore(app, schema, {} as DocumentDefinitions);
```

### 4. Use it

```javascript
// Fetch user document properly typed
const user: User = await firestore.user(userID).fetch();

// Save full user object
await firestore.user(userID).save(userData);

// Update only user's name field to "Looser"
await firestore.user(userID).updateField("name", "Looser");

// Delete user object
await firestore.user(userID).delete();

// Check if user object exists
await firestore.user(userID).exists();
```

### 5. Extend functionality

Obviously, you are much cooler than me. So, you have methods that you need to perform safely on your data. Extend my `FirestoreDocument` class with your custom methods and include it in the schema as a `class` key.

```javascript
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
    const token = getToken() // some mock function
    await this.updateField("token", token)
    return token;
  }
}

const schema = buildFirestoreSchema({
  users: {
    doc: "user",
    class: UserFirestoreDocument,
  }
} as const);
```

Now, your extended class will be used insted. This is the recommended way of setting up Elegant Chainable Firebase, having dedicated classes for each document with custom methods manipulating data as you need.

```javascript
await firestore.user(userID).levelUp(420);
await firestore.user(userID).generateToken();
```

> **🤤 Lessons learned:** Please, please, please, extend functionality of `FirestoreDocument` to craft the perfect API for your own use case.

## Storage Usage

### Defining your schema

### Initializing database
