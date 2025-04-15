const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "PasswordReset",
  tableName: "password_reset",
  columns: {
    id: { primary: true, type: "int", generated: true },
    expire_datetime: { type: "timestamp" },
    password_change_link: { type: "varchar", length: 255 },
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
