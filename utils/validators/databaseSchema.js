const Joi = require("joi");

const databaseSchema = {
	createDatabase(database) {
		const schema = Joi.object({
			db_name: Joi.string().required().messages({
				"string.base": "Database name must be a string",
				"any.required": "Database name is required",
			}),
			username: Joi.string().required().messages({
				"string.base": "Username must be a string",
				"any.required": "Username is required",
			}),
			password: Joi.string().required().messages({
				"string.base": "Password must be a string",
				"any.required": "Password is required",
			}),
			host: Joi.string().required().messages({
				"string.base": "Host must be a string",
				"any.required": "Host is required",
			}),
			port: Joi.number().integer().min(1).max(65535).required().messages({
				"number.base": "Port must be a number",
				"number.integer": "Port must be an integer",
				"number.min": "Port number must be at least 1",
				"number.max": "Port number must be less than or equal to 65535",
				"any.required": "Port is required",
			}),
		}).required();

		return schema.validate(database, { abortEarly: false });
	},
	updateDatabase(database) {
		const schema = Joi.object({
			database_id: Joi.string().required().messages({
				"string.base": "Database ID must be a string",
				"any.required": "Database ID is required",
			}),
			db_name: Joi.string().optional().messages({
				"string.base": "Database name must be a string",
			}),
			username: Joi.string().optional().messages({
				"string.base": "Username must be a string",
			}),
			password: Joi.string().optional().messages({
				"string.base": "Password must be a string",
			}),
			host: Joi.string().optional().messages({
				"string.base": "Host must be a string",
			}),
			port: Joi.number().integer().min(1).max(65535).optional().messages({
				"number.base": "Port must be a number",
				"number.integer": "Port must be an integer",
				"number.min": "Port number must be at least 1",
				"number.max": "Port number must be less than or equal to 65535",
			}),
		}).required();

		return schema.validate(database, { abortEarly: false });
	},
};

module.exports = { databaseSchema };
