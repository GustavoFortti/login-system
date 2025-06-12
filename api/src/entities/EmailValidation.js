// /src/entities/EmailValidation.js

const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "EmailValidation",
  tableName: "email_validation",
  columns: {
    id: { primary: true, type: "int", generated: true },
    expire_datetime: { type: "timestamp" },
    email_change_link: { type: "varchar", length: 255 },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE",
      eager: true,
      unique: true,
    },
  },
});
