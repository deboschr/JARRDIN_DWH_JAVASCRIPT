const express = require("express");
const router = express.Router();

const userRoute = require("./userRoute");
const jobRoute = require("./JobRoute");

router.get("/", (req, res) => {
	res.status(200).json("Wellcome to The Jarrdin Data Warehouse");
});

router.use("/user", userRoute);
router.use("/job", jobRoute);

module.exports = router;
