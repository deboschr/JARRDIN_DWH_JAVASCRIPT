const express = require("express");
const router = express.Router();

const { UserController } = require("../controllers/UserConstroller");

// Schedule
router.get("/", UserController.get);
router.post("/", UserController.post);
router.delete("/:id", UserController.delete);

module.exports = router;
