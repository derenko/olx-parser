import lodash from "lodash";
import { Low, JSONFile } from "lowdb";

import path from "path";

import { config } from "./config.mjs";

const DATABASE_FILE_NAME = path.join(config.root(), config.files.database);

const file = DATABASE_FILE_NAME;
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();

db.data = db.data || {};

const has = async (id) => {
  const posts = db.data;
  return posts[id];
};

const save = async (id) => {
  db.data[id] = id;
  await db.write();
};

export const storage = {
  has,
  save,
};
