import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const createOrganizationService = async ({ data }) => {
  const {
    name,
    email,
    address1,
    address2,
    city,
    state,
    postalCode,
    country,
    phone,
  } = data;
  const id = uuidv4();

  try {
    //insert one new organization into the organizations table
    const query = `INSERT into organizations (id, name, email, address_1, address_2, city, state, postal_code, country)
    VALUES (:id, :name, :email, :address_1, :address_2, :city, :state, :postal_code, :country)`;
    const organizations = await sequelize.query(query, {
      replacements: {
        id,
        name,
        email,
        address_1: address1,
        address_2: address2,
        city,
        state,
        postal_code: postalCode,
        country,
      },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(organizations);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch organizations");
  }
};

export const getAllOrganizationsService = async () => {
  try {
    const query = `SELECT * FROM organizations`;
    const organizations = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(organizations);
  } catch (error) {
    throw new Error("Failed to fetch organizations");
  }
};

export const getOrganizationByIdService = async (id) => {
  try {
    const query = `SELECT org.*, json_agg(
      json_build_object(
        'first_line', oh.first_line,
        'second_line', oh.second_line,
        'third_line', oh.third_line,
        'list_order', oh.list_order
      )
    ) AS highlights
    FROM organizations AS org
    LEFT JOIN organization_highlights AS oh
    ON org.id = oh.organization_id
    WHERE org.id = :id
    GROUP BY org.id;`;
    const organization = await sequelize.query(query, {
      replacements: { id: id },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(organization[0]);
  } catch (error) {
    throw new Error("Failed to fetch organization");
  }
};

export const getUserOrganizationsService = async (id) => {
  try {
    const query = `SELECT 
    org.id AS organization_id,
    org.name AS organization_name,
    roles.role_name AS user_role
  FROM 
    users 
  JOIN 
    user_roles ON users.id = user_roles.user_id
  JOIN 
    roles ON user_roles.role_id = roles.id
  JOIN 
    organizations AS org ON user_roles.organization_id = org.id
  WHERE 
    users.id = :userId`;
    const organizations = await sequelize.query(query, {
      replacements: { userId: id },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(organizations);
  } catch (error) {
    throw new Error("Failed to fetch organizations");
  }
};

export const updateOrganization = async (id, data) => {
  try {
    await Organization.update(data, { where: { id } });
  } catch (error) {
    throw new Error("Failed to update organization");
  }
};

export const deleteOrganization = async (id) => {
  try {
    await Organization.destroy({ where: { id } });
  } catch (error) {
    throw new Error("Failed to delete organization");
  }
};

export const getAllLabResearchByOrganizationIdService = async (id) => {
  try {
    const query = `SELECT
    *
    FROM
    lab_research
    WHERE
    organization_id = :id;`;
    const results = await sequelize.query(query, {
      replacements: { id: id },
      type: sequelize.QueryTypes.SELECT,
    });
    const research = results;
    if (research) {
      return deepCamelcaseKeys(research);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch lab research");
  }
};

export const getAllTagsService = async (id) => {
  try {
    const query = `SELECT id, organization_id, name, tag_type FROM organization_tags INNER JOIN tags ON organization_tags.tag_id = tags.id WHERE organization_id = :id`;
    const tags = await sequelize.query(query, {
      replacements: { id: id },
      type: sequelize.QueryTypes.SELECT,
    });
    if (tags) {
      return deepCamelcaseKeys(tags);
    }
  } catch (error) {
    throw new Error("Failed to fetch tags");
  }
};

export const getAllResourcesService = async (id) => {
  try {
    const query = `SELECT id, organization_id, title, description, resource_type, link FROM organization_resources INNER JOIN resources ON organization_resources.resource_id = resources.id WHERE organization_id = :id`;
    const tags = await sequelize.query(query, {
      replacements: { id: id },
      type: sequelize.QueryTypes.SELECT,
    });
    if (tags) {
      return deepCamelcaseKeys(tags);
    }
  } catch (error) {
    throw new Error("Failed to fetch resources");
  }
};
