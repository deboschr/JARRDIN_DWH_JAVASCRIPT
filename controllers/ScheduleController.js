const { Scheduler } = require("../utils/Scheduler");
const { Validator } = require("../utils/validator");

class ScheduleController {
	static async getAll(req, res) {
		try {
			const { error } = Validator.getAllSchedule(req.query);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			let readSchedule = await Scheduler.readAll(req.query, {
				EnterpriseID: req.dataLogin.EnterpriseID,
				OutletID: req.dataSession.OutletID,
			});

			res.status(200).json(readSchedule);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getOne(req, res) {
		try {
			let readSchedule = await Scheduler.readOne(req.params.id, {
				EnterpriseID: req.dataLogin.EnterpriseID,
				OutletID: req.dataSession.OutletID,
			});

			res.status(200).json(readSchedule);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async post(req, res) {
		try {
			const dataJob = {};

			const createSchedule = await Scheduler.scheduleTask(req.body);

			res.status(200).json({
				success: true,
				data: createSchedule,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async patch(req, res) {
		try {
			let { error } = Validator.updateSchedule(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const updateSchedule = await Scheduler.update(req.body, {
				EnterpriseID: req.dataLogin.EnterpriseID,
				OutletID: req.dataSession.OutletID,
				SparkUserID: req.dataLogin.SparkUserID,
			});

			res.status(200).json({
				success: true,
				data: updateSchedule,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteSchedule = await Scheduler.delete(
				req.params.id,
				req.dataLogin.EnterpriseID
			);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { ScheduleController };
