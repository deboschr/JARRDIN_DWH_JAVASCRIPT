const { userSchema } = require("./userSchema");
const { jobSchema } = require("./jobSchema");

const Validator = {
	Description: "Input Validator",
};

Object.assign(Validator, userSchema, jobSchema);

module.exports = { Validator };
