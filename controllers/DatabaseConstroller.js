const { DatabaseService } = require("../services/DatabaseService");
const { Validator } = require("../utils/validators");

class DatabaseController {
	static async getAll(req, res) {
		try {
			let readDatabase = await DatabaseService.findDatabase();

			res.status(200).json(readDatabase);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getOne(req, res) {
		try {
			let readDatabase = await DatabaseService.findDatabase({
				database_id: req.params.id,
			});

			res.status(200).json(readDatabase);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async post(req, res) {
		try {
			let { error } = Validator.createDatabase(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const newDatabase = await DatabaseService.createDatabase(
				req.body,
				req.dataSession
			);

			res.status(200).json({ success: true, data: newDatabase });
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

			let { error } = Validator.updateDatabase(updateData);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const updatedDatabase = await DatabaseService.updateDatabase(
				updateData,
				req.dataSession
			);

			res.status(200).json({ success: true, data: updatedDatabase });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteDatabase = await DatabaseService.deleteDatabase(
				req.params.id
			);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { DatabaseController };
