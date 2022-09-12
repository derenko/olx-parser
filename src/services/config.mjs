import dotenv from "dotenv";
import url from "url";
import path from "path";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.development",
});

export const config = {
  root: () => {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return path.join(__dirname, "../", "../");
  },
  files: {
    database: "database.json",
    cookies: "cookies.json",
  },
  env: {
    BOT_TOKEN: process.env.BOT_TOKEN,
    RECEIVER_TELEGRAM_ID: process.env.RECEIVER_TELEGRAM_ID,
    BASE_URL: process.env.BASE_URL,
    SEARCH_URL: process.env.SEARCH_URL,
    LOGIN_URL: process.env.LOGIN_URL,
    OLX_PASSWORD: process.env.OLX_PASSWORD,
    OLX_LOGIN: process.env.OLX_LOGIN,
    NODE_ENV: process.env.NODE_ENV,
  },
};
