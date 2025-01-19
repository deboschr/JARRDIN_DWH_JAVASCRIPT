const express = require("express");
const router = express.Router();

const { PageController } = require("../src/controllers/PageConstroller");
const {
	Authorization,
} = require("../src/controllers/middlewares/Authorization");

router.get("/signin", PageController.signin);
router.get("/signup", PageController.signup);
router.get("/dashboard", Authorization.decryption, PageController.dashboard);
router.get("/dbconfig", Authorization.decryption, PageController.dbconfig);
router.get("/job", Authorization.decryption, PageController.job);
router.get("/profile", Authorization.decryption, PageController.profile);

module.exports = router;
