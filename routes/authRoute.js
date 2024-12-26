const express = require("express");
const router = express.Router();

const { UserController } = require("../controllers/UserConstroller");
const { Authorization } = require("../middlewares/Authorization");

router.get("/", UserController.authPage);
router.post("/signin", UserController.signin);
router.post("/signup", Authorization.decryption, UserController.signup);
router.post("/signout", Authorization.decryption, UserController.signout);

module.exports = router;
