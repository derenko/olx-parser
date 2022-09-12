import { config } from "../services/config.mjs";
import moment from "moment";
import { extractors } from "./extractors.mjs";

export const formatters = {
  message: ({ link, details }) => {
    const phone = details.phone
      ? `${details.phone.replace(/ /g, "")}`
      : "Приховано";

    const time = extractors.time(details.date);
    const timeToKyivTimeZone = moment(time, "HH:mm")
      .add(3, "hour")
      .format("HH:mm");

    const date = time ? `Сьогодні о ${timeToKyivTimeZone}` : details.date;

    return `Нове оголошення на OLX.
Телефон: ${phone}
Дата: ${date}
Ціна: ${details.price}
Імя: ${details.name}
Посилання: ${config.env.BASE_URL}${link}`;
  },
};
