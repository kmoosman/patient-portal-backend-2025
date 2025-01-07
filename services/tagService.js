import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";

export const getAllTagsService = async () => {
  try {
    const query = `SELECT * FROM tags`;
    const tags = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    if (tags) {
      return deepCamelcaseKeys(tags);
    }
  } catch (error) {
    throw new Error("Failed to fetch tags");
  }
};
