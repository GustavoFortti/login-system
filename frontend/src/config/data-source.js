const { DataSource } = require("typeorm");
const User = require("../entities/User");
const PasswordReset = require("../entities/PasswordReset");
const EmailValidation = require("../entities/EmailValidation");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "db",
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "myuser",
  password: process.env.DB_PASSWORD || "mypassword",
  database: process.env.DB_NAME || "mydatabase",
  synchronize: true,
  logging: false,
  entities: [
    User,
    PasswordReset,
    EmailValidation,
  ],
});

module.exports = { AppDataSource };
