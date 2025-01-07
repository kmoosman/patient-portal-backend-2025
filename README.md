# Patient Portal Project

## Overview

This project is a prototype of a Patient Portal. The README is provisional and should be updated as the project evolves and its scope becomes more defined.

### Important Note

- **Project Status**: Prototype
- **Migration Status**: No auto migrations are present in the repository currently but you can manually run 12072023_base.sql to setup the database and tables needed
- **Environment Setup**: Utilizes both `.env` and `.env.development` files for environment variables.

## Local Setup Instructions

To run the Patient Portal locally, follow these steps:

### Database Configuration

1. **Update Database Configuration**:
   Open your database configuration file and update it to use environment variables. Ensure the following code is uncommented:

   ```
   const { database, username, host, dialect, password } = {
     database: process.env.DATABASE_NAME,
     username: process.env.DATABASE_USERNAME,
     host: process.env.DATABASE_HOST,
     dialect: "postgres",
   };
   ```

2. \*\*Comment Out Unnecessary Code:
   Find and comment out the following lines in the database configuration file:

```
const { database, username, host, dialect, password } =
extractDatabaseCredentials(process.env.DATABASE_URL);
```

Additionally, comment out the dialect options related to SSL:

```
// dialectOptions: {
//   ssl: {
//     rejectUnauthorized: false,
//   },
// },
```

3. \*\*Running the Application
   In your terminal, run the following command: `npm run dev`

4. \*\*Contributing
   As this is a prototype, contributions towards migrations, database seeding, and overall project development are highly encouraged. Please ensure you update this README accordingly with any significant changes or additions.

5. \*\*Requesting Additional Information
   For access to the project's schema, DDL, or any other specific inquiries, please contact the project maintainers
