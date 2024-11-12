const Joi = require("joi");

const userSchema = {
	loginRegister(user) {
		const schema = Joi.object({
			username: Joi.string().max(200).required(),
			password: Joi.string().min(8).max(200).required(),
		}).required();

		return schema.validate(user);
	},
};

module.exports = { userSchema };
