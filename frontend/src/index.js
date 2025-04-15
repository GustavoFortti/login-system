const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: ".env-dev" });

const { AppDataSource } = require("./config/data-source");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Database connected");
    app.use("/api", routes);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to the database", err);
  });
