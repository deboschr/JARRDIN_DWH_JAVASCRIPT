const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");
const userRoute = require("./userRoute");
const jobRoute = require("./jobRoute");

router.get("/", (req, res) => {
	res.redirect("/auth/v1");
});

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/job", jobRoute);

module.exports = router;
