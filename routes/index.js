const express = require("express");
const router = express.Router();

const pageRoute = require("./pageRoute");
const userRoute = require("./userRoute");
// const dbConfigRoute = require("./dbConfigRoute");
// const jobRoute = require("./jobRoute");

router.get("/", (req, res) => {
	res.status(200).json("Wellcome to The Jarrdin Data Warehouse");
});

router.use("/page/:version", pageRoute);

router.use("/api/:version/user", userRoute);
// router.use("/api/:version/dbconfig", dbConfigRoute);
// router.use("/api/:version/job", jobRoute);

module.exports = router;
