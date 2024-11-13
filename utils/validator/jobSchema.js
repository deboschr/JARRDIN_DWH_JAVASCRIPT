const Joi = require("joi");

const jobSchema = {
	createJob(job) {
		const schema = Joi.object({
			name: Joi.string().min(3).max(100).required(),
			time: Joi.string()
				.pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
				.message("Field 'time' harus dalam format TIME (HH:MM:SS)")
				.required(),
			step: Joi.number().integer().min(1).required(),
			period: Joi.string()
				.valid("MINUTE", "HOUR", "DAY", "MONTH", "YEAR")
				.required(),
			last_execute: Joi.string()
				.isoDate()
				.message(
					"Field 'last_execute' harus dalam format ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)"
				)
				.required(),
			source_name: Joi.string().min(3).max(100).required(),
			source_tables: Joi.array()
				.items(Joi.string().min(3).max(100).required())
				.min(1)
				.when("source_name", {
					is: "stg",
					then: Joi.required(),
					otherwise: Joi.forbidden(),
				}),
			destination_name: Joi.string().min(3).max(100).required(),
			destination_tables: Joi.array()
				.items(Joi.string().min(3).max(100).required())
				.min(1)
				.when("destination_name", {
					is: "dwh",
					then: Joi.required(),
					otherwise: Joi.forbidden(),
				}),
			duplicate_key: Joi.array()
				.items(Joi.string().min(3).max(100).required())
				.min(1)
				.when("destination_name", {
					is: "dwh",
					then: Joi.required(),
					otherwise: Joi.forbidden(),
				}),
		}).required();

		return schema.validate(job);
	},
};

module.exports = { jobSchema };
