const express = require("express");
const router = express.Router();

const { UserController } = require("../controllers/UserConstroller");
const { Authorization } = require("../middlewares/Authorization");

router.get("/v1", UserController.authPage);
router.post("/v1/signin", UserController.signin);
router.post("/v1/signup", UserController.signup);
router.post("/v1/signout", Authorization.decryption, UserController.signout);

module.exports = router;
