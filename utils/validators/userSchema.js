const Joi = require("joi");

const userSchema = {
	signin(user) {
		const schema = Joi.object({
			email: Joi.string().max(200).email().required(),
			password: Joi.string().min(8).max(200).pattern(/^\S+$/).required(),
		}).required();

		return schema.validate(user, { abortEarly: false });
	},
};

module.exports = { userSchema };
