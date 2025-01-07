import request from "supertest";
import app from "../app";
import sequelize from "../config/database";
let server;

beforeAll(async () => {
  await sequelize.authenticate(); // Establish the database connection
  server = await app.listen(3001); // Use async/await to properly wait for the server to start
  console.log("Server is running on port 3001");
});

afterAll(async () => {
  await server.close(); // Use async/await to properly wait for the server to close
  await sequelize.close(); // Close the database connection
});

describe("GET /", () => {
  it("should return 'Hello, World!'", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello, World!");
  });
});
