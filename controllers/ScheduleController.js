const { Scheduler } = require("../utils/Scheduler");
// const { Validator } = require("../utils/validator");

class ScheduleController {
	static async getAll(req, res) {
		try {
			let readSchedule = await Scheduler.readAll();

			res.status(200).json(readSchedule);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async post(req, res) {
		try {
			const dataJob = {
				name: req.body.name,
				time: req.body.time,
				step: req.body.step,
				period: req.body.period,
				last_execute: new Date(req.body.startDate),
				config: req.body.config,
				status: "NEW",
			};

			const createSchedule = await Scheduler.createTask(dataJob);

			res.status(200).json({
				success: true,
				data: createSchedule,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteSchedule = await Scheduler.cancelTask(req.params.id);

			res.status(200).json({ success: true, message: deleteSchedule });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { ScheduleController };
