import cron from "node-cron";

import { storage } from "./services/storage.mjs";
import { notifier } from "./services/notifier.mjs";
import { logger } from "./services/logger.mjs";
import { parser } from "./services/parser.mjs";
import { config } from "./services/config.mjs";

logger.info({
  message: "app started",
});

try {
  await parser.login();
  logger.info({
    message: "logged in successful",
  });
} catch (e) {
  logger.error({ message: "error when logging in" });
  console.log(e);
}

const main = async () => {
  try {
    const posts = await parser.parsePosts();

    for await (const { id, link } of posts) {
      if (await storage.has(id)) {
        logger.info({
          message: "id already exists",
          id,
          link,
        });
      } else {
        const details = await parser.parsePostDetails(
          `${config.env.BASE_URL}${link}`
        );

        await notifier.notify({
          id,
          link,
          details,
        });

        await storage.save(id);

        logger.info({
          message: "id saved to database",
          id,
          link,
        });
      }
    }
  } catch (e) {
    console.log(e);
    logger.error({
      message: "error in main function",
      e,
    });
  }
};

cron.schedule("* * * * *", main);
