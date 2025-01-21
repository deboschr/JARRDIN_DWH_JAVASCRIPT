const Joi = require("joi");

const jobSchema = {
	createJob(job) {
		const schema = Joi.object({
			name: Joi.string().required().messages({
				"string.base": "Name must be a string",
				"any.required": "Name is required",
			}),
			cron: Joi.string().required().messages({
				"string.base": "Cron expression must be a string",
				"any.required": "Cron expression is required",
			}),
			source_db_id: Joi.number().integer().required().messages({
				"number.base": "Source database ID must be a number",
				"number.integer": "Source database ID must be an integer",
				"any.required": "Source database ID is required",
			}),
			source_tables: Joi.array()
				.items(
					Joi.string().required().messages({
						"string.base": "Source table name must be a string",
						"any.required": "Source table name is required",
					})
				)
				.required()
				.messages({
					"array.base": "Source tables must be an array of strings",
					"any.required": "Source tables are required",
				}),
			destination_db_id: Joi.number().integer().required().messages({
				"number.base": "Destination database ID must be a number",
				"number.integer": "Destination database ID must be an integer",
				"any.required": "Destination database ID is required",
			}),
			destination_tables: Joi.array()
				.items(
					Joi.string().required().messages({
						"string.base": "Destination table name must be a string",
						"any.required": "Destination table name is required",
					})
				)
				.required()
				.messages({
					"array.base": "Destination tables must be an array of strings",
					"any.required": "Destination tables are required",
				}),
			duplicate_keys: Joi.array()
				.items(
					Joi.string().required().messages({
						"string.base": "Duplicate key must be a string",
						"any.required": "Duplicate key is required",
					})
				)
				.required()
				.messages({
					"array.base": "Duplicate keys must be an array of strings",
					"any.required": "Duplicate keys are required",
				}),
			transform_script: Joi.string().required().messages({
				"string.base": "Transform script must be a string",
				"any.required": "Transform script is required",
			}),
		}).required();

		return schema.validate(job, { abortEarly: false });
	},

	updateJob(job) {
		const schema = Joi.object({
			job_id: Joi.number().integer().required().messages({
				"number.base": "Job ID must be a number",
				"number.integer": "Job ID must be an integer",
				"any.required": "Job ID is required",
			}),
			name: Joi.string().optional().messages({
				"string.base": "Name must be a string",
			}),
			cron: Joi.string().optional().messages({
				"string.base": "Cron expression must be a string",
			}),
			source_db_id: Joi.number().integer().optional().messages({
				"number.base": "Source database ID must be a number",
				"number.integer": "Source database ID must be an integer",
			}),
			source_tables: Joi.array()
				.items(
					Joi.string().messages({
						"string.base": "Source table name must be a string",
					})
				)
				.optional()
				.messages({
					"array.base": "Source tables must be an array of strings",
				}),
			destination_db_id: Joi.number().integer().optional().messages({
				"number.base": "Destination database ID must be a number",
				"number.integer": "Destination database ID must be an integer",
			}),
			destination_tables: Joi.array()
				.items(
					Joi.string().messages({
						"string.base": "Destination table name must be a string",
					})
				)
				.optional()
				.messages({
					"array.base": "Destination tables must be an array of strings",
				}),
			duplicate_keys: Joi.array()
				.items(
					Joi.string().messages({
						"string.base": "Duplicate key must be a string",
					})
				)
				.optional()
				.messages({
					"array.base": "Duplicate keys must be an array of strings",
				}),
			transform_script: Joi.string().optional().messages({
				"string.base": "Transform script must be a string",
			}),
			status: Joi.string().valid("ACTIVE", "INACTIVE").optional().messages({
				"any.only": 'Status must be either "ACTIVE" or "INACTIVE"',
			}),
		}).required();

		return schema.validate(job, { abortEarly: false });
	},
};

module.exports = { jobSchema };
