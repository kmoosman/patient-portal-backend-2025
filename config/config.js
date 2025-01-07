const config = {
  development: {
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
  },
  production: {
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    dialect: process.env.DATABASE_DIALECT,
  },
  test: {
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT,
  },
};

export default config;
