import admin from "firebase-admin";
import { DownloadOptions, File, SaveOptions } from "@google-cloud/storage";
import { getDownloadURL } from "firebase-admin/storage";
import nodePath from "path";

/**
 * Main class used to access and manipulate Firestore Storage files. Inherit this class to extend with custom functionality as needed.
 */
export class StorageFile {
  file: File;

  constructor(public path: string) {
    this.file = bucket().file(path);
  }

  async upload(fileBuffer: Buffer, options?: SaveOptions) {
    return await this.file.save(fileBuffer, options);
  }

  async delete() {
    return await this.file.delete();
  }

  async download(options: DownloadOptions) {
    const [buffer] = await this.file.download(options);
    return buffer;
  }

  async downloadUrl() {
    return await getDownloadURL(this.file);
  }

  async getUniqueFileName() {
    return await getUniqueFileName(this.path);
  }
}

/**
 * Main class used to access and manipulate the Firestore Storage folders. Inherit this class to extend with custom functionality as needed.
 */
export class StorageFolder {
  constructor(public path: string) {}

  async delete() {
    return await bucket().deleteFiles({ prefix: `${this.path}/` });
  }

  file(name: string) {
    return new StorageFile(`${this.path}/${name}`);
  }

  async getUniqueFileName(name: string) {
    return await getUniqueFileName(`${this.path}/${name}`);
  }
}

/**
 * Generate a unique file name, given a desired path.
 * @param fileWithPath Full path to the file.
 * @returns string path with a unique file name at the specified path.
 */
export const getUniqueFileName = async (fileWithPath: string): Promise<string> => {
  const pathArray = fileWithPath.split("/");
  const originalFileName = pathArray.pop();
  if (!originalFileName) throw new Error("Can't check if file name is unique. Invalid file path.");

  const filePath = pathArray.join("/");
  const parsed = nodePath.parse(originalFileName);
  const fileExtension = parsed.ext;
  let fileName = parsed.name;

  let step = 0;
  while ((await bucket().file(`${filePath}/${fileName}${fileExtension}`).exists())[0]) {
    step++;
    fileName = `${fileName}-${step}`;
  }
  return `${fileName}${fileExtension}`;
};

const bucket = () => {
  if (admin.apps.length > 0) {
    return admin.app().storage().bucket();
  }

  throw new Error("Firebase app is not initialized. Please initialize Firebase first.");
};
