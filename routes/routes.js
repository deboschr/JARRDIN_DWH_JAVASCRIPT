const express = require("express");
const router = express.Router();

const { Controller } = require("./controllers/Controller");

router.get("/", (req, res) => {
	res.status(200).json("Wellcome to The Jarrdin Data Warehouse");
});

// Schedule
router.get("/schedule", Controller.getAll);
router.post("/schedule", Controller.post);
router.delete("/schedule/:id", Controller.delete);

module.exports = router;
