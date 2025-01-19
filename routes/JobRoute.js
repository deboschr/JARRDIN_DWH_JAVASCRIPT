const express = require("express");
const router = express.Router();

const { JobController } = require("../src/controllers/JobConstroller");
const {
	Authorization,
} = require("../src/controllers/middlewares/Authorization");

router.use("/", Authorization.decryption);

router.get("/", JobController.jobPage);
router.get("/:id", JobController.getOne);
router.post("/", JobController.post);
router.patch("/:id", JobController.update);
router.delete("/:id", JobController.delete);

module.exports = router;
