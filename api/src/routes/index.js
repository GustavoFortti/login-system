const express = require("express");
const router = express.Router();

const loginRoutes = require("./v1/app/login");
const userRoutes = require("./v1/app/auth/user");

router.use("/v1/app/login", loginRoutes);
router.use("/v1/app/auth/user", userRoutes);

module.exports = router;
