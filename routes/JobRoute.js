const express = require("express");
const router = express.Router();

const { JobController } = require("../controllers/JobConstroller");

// Schedule
router.get("/", JobController.get);
router.post("/", JobController.post);
router.delete("/:id", JobController.delete);

module.exports = router;
