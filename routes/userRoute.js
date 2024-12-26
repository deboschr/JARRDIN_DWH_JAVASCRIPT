const express = require("express");
const router = express.Router();

const { UserController } = require("../controllers/UserConstroller");
const { Authorization } = require("../middlewares/Authorization");

router.get("/signin", UserController.signinPage);
router.post("/signin", UserController.signin);
router.post("/signup", Authorization.decryption, UserController.signup);
router.post("/signout", Authorization.decryption, UserController.signout);

router.get("/", Authorization.decryption, UserController.getAll);
router.get("/:id", Authorization.decryption, UserController.getOne);
router.patch("/:id", Authorization.decryption, UserController.update);
router.delete("/:id", Authorization.decryption, UserController.delete);

module.exports = router;
