import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";

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
    throw new Error("Failed to fetch user organizations");
  }
};

export const isUserAdminService = async (email) => {
  try {
    const query = `SELECT * FROM user_roles WHERE auth_emails = :email AND role_id = :role`;
    const user = await sequelize.query(query, {
      replacements: { email: email, role: process.env.ADMIN_ROLE_ID },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(user.length > 0);
  } catch (error) {
    throw new Error("Failed to fetch admin status");
  }
};

export const getUserByEmailService = async (email) => {
  try {
    const query = `SELECT * FROM user_roles WHERE auth_emails = :auth_email AND role_id = :role`;
    const user = await sequelize.query(query, {
      replacements: { auth_email: email, role: 1 },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(user);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch user");
  }
};

export const getUserById = async (id) => {
  try {
    const query = `SELECT * FROM users where id = :id`;
    const user = await sequelize.query(query, {
      replacements: { id: id },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(user);
  } catch (error) {
    throw new Error("Failed to fetch user by id");
  }
};

export const getUserAccessLevelService = async ({ userId, patientId }) => {
  try {
    const query = `SELECT COALESCE(
      (SELECT access_level_id 
       FROM patient_user_access 
       WHERE user_id = :userId AND patient_id = :patientId),
      :defaultAccessLevel) AS access_level_id;
    `;
    const result = await sequelize.query(query, {
      replacements: {
        userId,
        patientId,
        defaultAccessLevel: process.env.DEFAULT_ACCESS_LEVEL
      },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(result.length > 0 ? result[0].access_level_id : null);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch user access level");
  }
};

export const getClerkUserIdsService = async (userId) => {
  try {
    const query = `SELECT id, clerk_id from users where clerk_id = :userId;`
    const result = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(result.length > 0 ? result[0] : null);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch clerk id");
  }
};

export const getUserPatientAccountsService = async (userId) => {
  try {
    const query = `SELECT 
    pua.*,
    p.first_name,
    p.last_name
FROM 
    patient_user_access pua
JOIN 
    patients p ON pua.patient_id = p.id
WHERE 
    pua.user_id = :userId;
`
    const result = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(result);
  }
  catch (error) {
    console.log(error);
    throw new Error("Failed to fetch patient accounts");
  }
}