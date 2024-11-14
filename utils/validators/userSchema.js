const Joi = require("joi");

const userSchema = {
	loginRegister(user) {
		const schema = Joi.object({
			username: Joi.string()
				.max(200)
				.trim()
				.pattern(/^\S+$/) // memastikan tidak ada spasi di username
				.required(),
			password: Joi.string()
				.min(8)
				.max(200)
				.pattern(/^\S+$/) // memastikan tidak ada spasi di password
				.required(),
		}).required();

		return schema.validate(user, { abortEarly: false });
	},
};

module.exports = { userSchema };
