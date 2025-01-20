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

	static async findUser(identifier) {
		try {
			let findUser;
			if (identifier?.email) {
				findUser = await UserRepository.readOneByEmail(identifier.email);
			} else if (identifier?.user_id) {
				findUser = await UserRepository.readOneById(identifier.user_id);
			} else {
				findUser = await UserRepository.readAll();
			}

			if (!findUser) {
				const newError = new Error(`User not found.`);
				newError.status = 404;
				throw newError;
			}

			return findUser;
		} catch (error) {
			throw error;
		}
	}

	static async createUser(dataUser) {
		try {
			const findUser = await UserRepository.readOneByEmail(dataUser.email);

			if (findUser) {
				const newError = new Error(`Email is already registered.`);
				newError.status = 409;
				throw newError;
			}

			dataUser.password = await Authentication.encryption(dataUser.password);

			const newUser = await UserRepository.create(dataUser);

			return {
				user_id: newUser.user_id,
				name: newUser.name,
				email: newUser.email,
				status: newUser.status,
			};
		} catch (error) {
			throw error;
		}
	}

	static async updateUser(dataUser) {
		try {
			if (dataUser.password) {
				dataUser.password = await Authentication.encryption(dataUser.password);
			}

			const updatedUser = await UserRepository.update(dataUser);

			return updatedUser;
		} catch (error) {
			throw error;
		}
	}

	static async deleteUser(userId) {
		try {
			const updatedUser = await UserRepository.delete(userId);

			return updatedUser;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = { UserService };
