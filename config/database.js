import { Sequelize } from "sequelize";

const env = process.env.NODE_ENV || "development";


// Dynamically import dotenv in development
if (env !== 'production') {
  const { default: dotenv } = await import('dotenv');
  dotenv.config({ path: '.env.development' });

}

function createDevelopmentConnection() {
  const { DATABASE_NAME, DATABASE_USERNAME, DATABASE_HOST, DATABASE_PASSWORD } = process.env;
  return new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
    host: DATABASE_HOST,
    dialect: 'postgres',
    dialectOptions: {}
  });
}

function createProductionConnection() {
  const { database, username, password, host } = extractDatabaseCredentials(process.env.DATABASE_URL);
  return new Sequelize(database, username, password, {
    host,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });
}

function extractDatabaseCredentials(databaseUrl) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port,
    database: url.pathname.substring(1),
    username: url.username,
    password: url.password,
  };
}

// Create the connection based on environment
const sequelize = env === 'production'
  ? createProductionConnection()
  : createDevelopmentConnection();

export default sequelize;
