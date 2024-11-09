const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.status(200).json("Wellcome to The Jarrdin Data Warehouse");
});

module.exports = router;
