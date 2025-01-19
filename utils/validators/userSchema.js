const Joi = require("joi");

const userSchema = {
	signin(user) {
		const schema = Joi.object({
			email: Joi.string().email().max(200).required().messages({
				"string.base": "Email must be a string",
				"string.email": "Please enter a valid email address",
				"string.max": "Email must be less than or equal to 200 characters",
				"any.required": "Email is required",
			}),
			password: Joi.string()
				.min(8)
				.max(200)
				.pattern(/^\S+$/)
				.required()
				.messages({
					"string.base": "Password must be a string",
					"string.min": "Password must be at least 8 characters long",
					"string.max": "Password must be less than or equal to 200 characters",
					"string.pattern.base": "Password must not contain spaces",
					"any.required": "Password is required",
				}),
		}).required();

		return schema.validate(user, { abortEarly: false });
	},
	signup(user) {
		const schema = Joi.object({
			name: Joi.string().max(200).required().messages({
				"string.base": "Name must be a string",
				"string.max": "Name must be less than or equal to 200 characters",
				"any.required": "Name is required",
			}),
			email: Joi.string().email().max(200).required().messages({
				"string.base": "Email must be a string",
				"string.email": "Please enter a valid email address",
				"string.max": "Email must be less than or equal to 200 characters",
				"any.required": "Email is required",
			}),
			password: Joi.string()
				.min(8)
				.max(200)
				.pattern(/^\S+$/)
				.required()
				.messages({
					"string.base": "Password must be a string",
					"string.min": "Password must be at least 8 characters long",
					"string.max": "Password must be less than or equal to 200 characters",
					"string.pattern.base": "Password must not contain spaces",
					"any.required": "Password is required",
				}),
		}).required();

		return schema.validate(user, { abortEarly: false });
	},
	updateUser(user) {
		const schema = Joi.object({
			user_id: Joi.number().integer().required().messages({
				"number.base": "User ID must be a number",
				"number.integer": "User ID must be an integer",
				"any.required": "User ID is required",
			}),
			name: Joi.string().max(200).optional().messages({
				"string.base": "Name must be a string",
				"string.max": "Name must be less than or equal to 200 characters",
			}),
			email: Joi.string().email().max(200).optional().messages({
				"string.base": "Email must be a string",
				"string.email": "Please enter a valid email address",
				"string.max": "Email must be less than or equal to 200 characters",
			}),
			password: Joi.string()
				.min(8)
				.max(200)
				.pattern(/^\S+$/)
				.optional()
				.messages({
					"string.base": "Password must be a string",
					"string.min": "Password must be at least 8 characters long",
					"string.max": "Password must be less than or equal to 200 characters",
					"string.pattern.base": "Password must not contain spaces",
				}),
			status: Joi.string().valid("active", "nonactive").optional().messages({
				"any.only": 'Status must be either "active" or "nonactive"',
			}),
		}).required();

		return schema.validate(user, { abortEarly: false });
	},
};

module.exports = { userSchema };
