const { JobService } = require("../services/JobService");
const { Validator } = require("../utils/validators");

class JobController {
	static async jobPage(req, res) {
		try {
			let readJob = await JobService.read();

			res.status(200).render("job", {
				page: "job",
				layout: "layouts/main",
				data: JSON.stringify(readJob),
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getOne(req, res) {
		try {
			let readJob = await JobService.read();

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

			const createJob = await JobService.create(req.body, req.dataSession);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async update(req, res) {
		try {
			const activateJob = await JobService.activate(req.params.id);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteJob = await JobService.delete(req.params.id);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { JobController };
