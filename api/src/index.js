const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: ".env-dev" });

const { AppDataSource } = require("./config/data-source");
const routes = require("./routes");
const router = express.Router();

const redisClient = require("./config/redisClient");

const app = express();
app.use(cors());
app.use(express.json());

router.get("/", (req, res) => {
  res.send("API is running...");
}
);

async function startServer() {
  try {
    await redisClient.connect();
    console.log("📦 Redis connected");

    await AppDataSource.initialize();
    console.log("📦 MySQL connected");

    app.use("/api", routes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
  }
}

startServer();
