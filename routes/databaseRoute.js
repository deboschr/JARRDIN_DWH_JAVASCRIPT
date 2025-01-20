const express = require("express");
const router = express.Router();

const { DatabaseController } = require("../controllers/DatabaseConstroller");
const { Authorization } = require("../middlewares/Authorization");

router.use("/", Authorization.decryption);

router.get("/", DatabaseController.getAll);
router.get("/:id", DatabaseController.getOne);
router.post("/", DatabaseController.post);
router.patch("/:id", DatabaseController.update);
router.delete("/:id", DatabaseController.delete);

module.exports = router;
