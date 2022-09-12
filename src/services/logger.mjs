import pino from "pino";
import moment from "moment";

export const logger = pino({
  timestamp: () => `,"time": ${moment().format("DD.MM HH:mm:ss")}`,
});
