const { UserService } = require("../services/UserService");
// const { Validator } = require("../utils/validator");

class UserController {
	static async get(req, res) {
		try {
			let readUser = await UserService.read();

			res.status(200).json(readUser);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async post(req, res) {
		try {
			const createUser = await UserService.create(req.body, req.dataUser);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteUser = await UserService.delete(req.params.id);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { UserController };
