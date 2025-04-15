const express = require("express");
const router = express.Router();

const loginRoutes = require("./v1/app/login");

router.use("/v1/app/login", loginRoutes);

module.exports = router;
