const { userSchema } = require("./userSchema");
const { databaseSchema } = require("./databaseSchema");
const { jobSchema } = require("./jobSchema");

const Validator = {
	Description: "Input Validator",
};

Object.assign(Validator, userSchema, databaseSchema, jobSchema);

module.exports = { Validator };
