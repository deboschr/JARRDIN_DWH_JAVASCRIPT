const express = require("express");
const router = express.Router();

const { JobController } = require("../controllers/JobConstroller");
const { Authorization } = require("../utils/Authorization");

// Schedule
router.get("/", Authorization.decryption, JobController.get);
router.post("/", Authorization.decryption, JobController.post);
router.delete("/:id", Authorization.decryption, JobController.delete);

module.exports = router;
