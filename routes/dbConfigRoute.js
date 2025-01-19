const express = require("express");
const router = express.Router();

const { UserController } = require("../src/controllers/UserConstroller");
const {
	Authorization,
} = require("../src/controllers/middlewares/Authorization");

router.get("/v1", UserController.authPage);
router.post("/v1/signin", UserController.signin);
router.post("/v1/signup", UserController.signup);
router.post("/v1/signout", Authorization.decryption, UserController.signout);

module.exports = router;
