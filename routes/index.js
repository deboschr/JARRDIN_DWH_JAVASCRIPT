const express = require("express");
const router = express.Router();

const userRoute = require("./userRoute");
const jobRoute = require("./JobRoute");

router.use("/user", userRoute);
router.use("/job", jobRoute);

module.exports = { router };
