const { JobService } = require("../services/JobService");
const { Validator } = require("../utils/validators");

class JobController {
	static async getAll(req, res) {
		try {
			let readJob = await JobService.findJob();

			res.status(200).json(readJob);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getOne(req, res) {
		try {
			let readJob = await JobService.findJob({
				database_id: req.params.id,
			});

			res.status(200).json(readJob);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async post(req, res) {
		try {
			let { error } = Validator.createJob(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const newJob = await JobService.createJob(
				req.body,
				req.dataSession
			);

			res.status(200).json({ success: true, data: newJob });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async update(req, res) {
		try {
			const updateData = {
				...req.body,
				database_id: req.params.id,
			};

			let { error } = Validator.updateJob(updateData);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const updatedJob = await JobService.updateJob(
				updateData,
				req.dataSession
			);

			res.status(200).json({ success: true, data: updatedJob });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteJob = await JobService.deleteJob(
				req.params.id
			);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { JobController };
