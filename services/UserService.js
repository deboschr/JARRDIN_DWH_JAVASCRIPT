const { UserRepository } = require("../repositories/UserRepository.js");
const { Authentication } = require("../middlewares/Authentication");
const { Authorization } = require("../middlewares/Authorization");

class UserService {
	static async signin(dataUser) {
		try {
			const findUser = await UserRepository.readOneByEmail(dataUser.email);

			if (!findUser) {
				const newError = new Error(`Email salah.`);
				newError.status = 400;
				throw newError;
			}

			const isMatch = await Authentication.decryption(
				findUser.password,
				dataUser.password
			);

			if (!isMatch) {
				const newError = new Error(`Password salah.`);
				newError.status = 400;
				throw newError;
			}

			delete findUser.password;
			
			const token = await Authorization.encryption(findUser);

			return {
				payload: findUser,
				token: token,
			};
		} catch (error) {
			throw error;
		}
	}
}

module.exports = { UserService };
