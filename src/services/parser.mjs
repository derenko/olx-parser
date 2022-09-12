import axios from "axios";
import { load } from "cheerio";
import puppeteer from "puppeteer";

import { logger } from "./logger.mjs";
import { config } from "./config.mjs";
import { cookies } from "./cookies.mjs";
import { extractors } from "../utils/extractors.mjs";
import { selectors } from "../utils/selectors.mjs";

const http = axios.create({
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

const getPageMarkup = async (page = 1) => {
  try {
    const response = await http.get(`${config.env.SEARCH_URL}&page=${page}`);
    return response.data;
  } catch (e) {
    console.log(e.status);
  }
};

const getAvailablePages = async () => {
  try {
    const markup = await getPageMarkup();
    const $ = load(markup);

    const pages = $(selectors.elements.pagination);

    return Array.from(pages.map((_, page) => $(page).text()));
  } catch (e) {
    console.log(e);
    logger.error({ message: "cannot get pagination", e });
  }
};

const browserConfig = {
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

const disableUnusedTypesOfFiles = (req) => {
  if (
    req.resourceType() === "image" ||
    req.resourceType() === "media" ||
    req.resourceType() === "font" ||
    req.resourceType() === "stylesheet"
  ) {
    return req.abort();
  } else {
    req.continue();
  }
};

export const parser = {
  parsePosts: async () => {
    let result = [];
    const pages = await getAvailablePages();

    for await (const page of pages) {
      logger.info({
        message: `searching at page: ${page}`,
      });

      const markup = await getPageMarkup(page);
      const $ = load(markup);

      const posts = $(selectors.elements.posts);

      result = [
        ...result,
        ...Array.from(
          posts.map((_, post) => {
            const link = $(post).attr("href");
            const id = extractors.id(link);

            return {
              id,
              link,
            };
          })
        ),
      ];
    }

    return result;
  },
  parsePostDetails: async (link) => {
    try {
      const browser = await puppeteer.launch(browserConfig);

      const page = await browser.newPage();

      await cookies.load(page);

      await page.setRequestInterception(true);

      page.on("request", disableUnusedTypesOfFiles);

      page.goto(link, { waitUntil: "networkidle2" });

      let phone;

      try {
        const $$button = await page.waitForSelector(selectors.buttons.phone);

        if ($$button) {
          await $$button.click();
          const $$phone = await page.waitForSelector(selectors.texts.phone);
          phone = await $$phone.evaluate((el) => el.textContent);
        }
      } catch (e) {
        logger.error({
          message: "error when searching phone",
          e,
        });
        console.log("error when searching phone", e);
      }

      const $$name = await page.waitForSelector(selectors.texts.name);
      const $$date = await page.waitForSelector(selectors.texts.date);
      const $$price = await page.waitForSelector(selectors.texts.price);

      const date = await $$date.evaluate((el) => el.textContent);
      const price = await $$price.evaluate((el) => el.textContent);
      const name = await $$name.evaluate((el) => el.textContent);

      await page.close();

      logger.info({
        message: "parsed details for post",
        link,
        details: {
          date,
          price,
          name,
          phone,
        },
      });

      await browser.close();

      return { phone, date, price, name };
    } catch (e) {
      console.log(e);
      logger.error({ message: "error when parsing details", link });
    }
  },
  login: async () => {
    const browser = await puppeteer.launch(browserConfig);

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on("request", disableUnusedTypesOfFiles);

    page.goto(config.env.LOGIN_URL, { waitUntil: "networkidle2" });

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    const $$email = await page.waitForSelector(selectors.inputs.email);
    const $$password = await page.waitForSelector(selectors.inputs.password);
    const $$button = await page.waitForSelector(selectors.buttons.login);

    await page.exposeFunction("credentials", () => ({
      password: config.env.OLX_PASSWORD,
      login: config.env.OLX_LOGIN,
    }));

    await $$email.evaluate(async (el) => {
      const { login } = await window.credentials();
      el.value = login;
    });

    await $$password.evaluate(async (el) => {
      const { password } = await window.credentials();
      el.value = password;
    });

    await $$button.click();

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await cookies.save(page);

    await browser.close();
  },
};
