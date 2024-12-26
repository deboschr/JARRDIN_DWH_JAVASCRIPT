const { UserService } = require("../services/UserService");
const { Validator } = require("../utils/validators");
const { PasswordManager } = require("../utils/PasswordManager");
const { Authorization } = require("../middlewares/Authorization");

class UserController {
	static async authPage(req, res) {
		try {
			res.render("signin", { layout: false });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async signin(req, res) {
		try {
			let { error } = Validator.signinSignup(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const findUser = await UserService.readOne(req.body.username);

			if (!findUser) {
				const newError = new Error(`Username salah.`);
				newError.status = 400;
				throw newError;
			}

			const isMatch = await PasswordManager.decryption(
				findUser.password,
				req.body.password
			);

			if (!isMatch) {
				const newError = new Error(`Password salah.`);
				newError.status = 400;
				throw newError;
			}

			const token = await Authorization.encryption(findUser);

			res.set("Token", `Bearer ${token}`);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async signup(req, res) {
		try {
			let { error } = Validator.signinSignup(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const findUser = await UserService.readOne(req.body.username);

			if (findUser) {
				const newError = new Error(`Username sudah terdaftar.`);
				newError.status = 400;
				throw newError;
			}

			const hashedPassword = await PasswordManager.encryption(
				req.body.password
			);

			req.body.password = hashedPassword;

			const createUser = await UserService.create(req.body);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async signout(req, res) {
		try {
			let { error } = Validator.signinSignup(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const findUser = await UserService.readOne(req.body.username);

			if (findUser) {
				const newError = new Error(`Username sudah terdaftar.`);
				newError.status = 400;
				throw newError;
			}

			const hashedPassword = await PasswordManager.encryption(
				req.body.password
			);

			req.body.password = hashedPassword;

			const createUser = await UserService.create(req.body);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async userPage(req, res) {
		try {
			let readUser = await UserService.readAll();

			res.status(200).json(readUser);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getOne(req, res) {
		try {
			let readUser = await UserService.readAll();

			res.status(200).json(readUser);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async update(req, res) {
		try {
			const deleteUser = await UserService.delete(req.params.id);

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
