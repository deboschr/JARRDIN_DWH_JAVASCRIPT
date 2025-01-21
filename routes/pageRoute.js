const express = require("express");
const router = express.Router();

const { PageController } = require("../controllers/PageConstroller");
const { Authorization } = require("../middlewares/Authorization");

router.get("/signin", PageController.signin);
router.get("/dashboard", Authorization.decryption, PageController.dashboard);
router.get("/database", Authorization.decryption, PageController.database);
router.get("/job", Authorization.decryption, PageController.job);
router.get("/user", Authorization.decryption, PageController.user);
router.get("/profile", Authorization.decryption, PageController.profile);

module.exports = router;
