const express = require("express");
const router = express.Router();

const { UserController } = require("../controllers/UserConstroller");
const { Authorization } = require("../middlewares/Authorization");

router.use("/", Authorization.decryption);

router.get("/", Authorization.decryption, UserController.userPage);
router.get("/:id", Authorization.decryption, UserController.getOne);
router.patch("/:id", Authorization.decryption, UserController.update);
router.delete("/:id", Authorization.decryption, UserController.delete);

module.exports = router;
