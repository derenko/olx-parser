import fs from "fs/promises";
import path from "path";

import { config } from "./config.mjs";

const COOKIES_FILE_NAME = path.join(config.root(), config.files.cookies);

const save = async (page) => {
  const cookies = await page.cookies();
  const json = JSON.stringify(cookies, null, 2);
  await fs.writeFile(COOKIES_FILE_NAME, json);
};

const load = async (page) => {
  const cookies = await fs.readFile(COOKIES_FILE_NAME);
  const json = JSON.parse(cookies);
  await page.setCookie(...json);
};

export const cookies = {
  load,
  save,
};
