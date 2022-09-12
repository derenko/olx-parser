import { Telegraf } from "telegraf";

import { logger } from "./logger.mjs";
import { config } from "./config.mjs";
import { formatters } from "../utils/formatters.mjs";

const bot = new Telegraf(config.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Вітаю."));

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

const notify = async ({ link, details }) => {
  try {
    await bot.telegram.sendMessage(
      config.env.RECEIVER_TELEGRAM_ID,
      formatters.message({ link, details })
    );

    logger.info({
      message: "message sended",
      link,
    });
  } catch (e) {
    console.log(e);
    logger.error({ message: "message was not sended", link });
  }
};

export const notifier = {
  notify,
};
