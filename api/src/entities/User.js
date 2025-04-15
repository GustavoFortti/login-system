const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { primary: true, type: "int", generated: true },
    name: { type: "varchar", length: 255 },
    family_name: { type: "varchar", length: 255 },
    picture: { type: "varchar", length: 255, nullable: true },
    email: { type: "varchar", length: 255, unique: true },
    password: { type: "varchar", length: 255 },
    is_google_account: { type: "boolean", default: false },
    valid_user: { type: "boolean", default: false },
    date_of_birth: { type: "varchar", length: 255, nullable: true },
    creation_date: { type: "varchar", length: 255 },
    last_location: { type: "varchar", length: 255, nullable: true },
    refresh_token: { type: "text", nullable: true },
  },
});
