const express = require("express");
const router = express.Router();

const { UserController } = require("../controllers/UserConstroller");
const { Authorization } = require("../utils/Authorization");

// Schedule
router.get("/", Authorization.decryption, UserController.get);
router.post("/login", UserController.login);
router.post("/register", Authorization.decryption, UserController.register);
router.delete("/:id", Authorization.decryption, UserController.delete);

module.exports = router;
