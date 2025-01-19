const express = require("express");
const router = express.Router();

const { UserController } = require("../src/controllers/UserConstroller");
const {
	Authorization,
} = require("../src/controllers/middlewares/Authorization");

router.get("/signin", UserController.signin);
router.get("/signup", Authorization.decryption, UserController.signup);
router.get("/signout", Authorization.decryption, UserController.signout);

router.get("/", Authorization.decryption, UserController.userPage);
router.get("/:id", Authorization.decryption, UserController.getOne);
router.patch("/:id", Authorization.decryption, UserController.update);
router.delete("/:id", Authorization.decryption, UserController.delete);

module.exports = router;
