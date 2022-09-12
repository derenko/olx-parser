export const extractors = {
  id: (link) => link.split("/")[link.split("/").length - 1].split(".")[0],
  time: (str) => {
    const TIME_REG_EXP = /(?:[01]\d|2[0123]):(?:[012345]\d)/gm;
    const match = str.match(TIME_REG_EXP);

    return match ? match[0] : null;
  },
};
