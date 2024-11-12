const express = require("express");
const router = express.Router();

const { ScheduleController } = require("./controllers/ScheduleController");

router.get("/", (req, res) => {
	res.status(200).json("Wellcome to The Jarrdin Data Warehouse");
});

// Schedule
router.get("/schedule", ScheduleController.getAll);
router.post("/schedule", ScheduleController.post);
router.delete("/schedule/:id", ScheduleController.delete);

module.exports = router;
