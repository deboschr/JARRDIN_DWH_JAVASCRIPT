const { UserService } = require("../services/UserService");
const { Validator } = require("../utils/validators");
const { Authentication } = require("../middlewares/Authentication");

class UserController {
	static async signin(req, res) {
		try {
			let { error } = Validator.signin(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const { payload, token } = await UserService.signin(req.body);

			res.set("token", `Bearer ${token}`);
			req.session.dataSession = payload;

			res.status(200).json({ success: true, data: payload });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async signup(req, res) {
		try {
			let { error } = Validator.signup(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const newUser = await UserService.createUser(req.body);

			res.status(200).json({ success: true, data: newUser });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async signout(req, res) {
		try {
			// Destroying the session
			req.session.destroy((err) => {
				if (err) {
					throw err;
				}
			});

			res
				.status(200)
				.json({ success: true, message: "Successfully signed out." });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getAll(req, res) {
		try {
			let readUser = await UserService.findUser();

			res.status(200).json(readUser);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getOne(req, res) {
		try {
			let readUser = await UserService.findUser({ user_id: req.params.id });

			res.status(200).json(readUser);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async update(req, res) {
		try {
			const updateData = {
				...req.body,
				user_id: req.params.id,
			};

			let { error } = Validator.updateUser(updateData);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const updatedUser = await UserService.updateUser(updateData);

			res.status(200).json({ success: true, data: updatedUser });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteUser = await UserService.deleteUser(req.params.id);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { UserController };
