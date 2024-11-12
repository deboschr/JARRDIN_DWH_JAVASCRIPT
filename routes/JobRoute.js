const express = require("express");
const router = express.Router();

const { JobController } = require("../controllers/JobConstroller");

// Schedule
router.get("/job", JobController.get);
router.post("/job", JobController.post);
router.delete("/job/:id", JobController.delete);

module.exports = router;
