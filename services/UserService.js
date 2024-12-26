const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { Sequelize } = require("sequelize");

const { UserModel } = require("../models/UserModel");

class UserService {
	static async readAll() {
		try {
			const findUser = await UserModel.findAll({
				order: [["name", "ASC"]],
				raw: true,
				attributes: ["name", "email", "role"],
			});

			return findUser;
		} catch (error) {
			throw error;
		}
	}

	static async readOne(email) {
		try {
			const findUser = await UserModel.findOne({
				where: { email: email },
				raw: true,
				attributes: ["user_id", "name", "email", "password"],
			});

			return findUser;
		} catch (error) {
			throw error;
		}
	}

	static async create(dataUser) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const createUser = await UserModel.create(
				{
					name: dataUser.name,
					email: dataUser.email,
					password: dataUser.password,
				},
				{ transaction }
			);

			await transaction.commit();

			return createUser;
		} catch (error) {
			if (transaction) await transaction.rollback();

			if (error instanceof Sequelize.UniqueConstraintError) {
				const newError = new Error(error.errors[0].message);
				newError.status = 400;
				throw newError;
			}

			throw error;
		}
	}

	static async delete(userId) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const findUser = await UserModel.finOne({
				where: { user_id: userId },
			});

			if (!findUser) {
				throw new Error(`User tidak ditemukan.`);
			}

			// Menghapus User dari database
			await findUser.destroy({ transaction });

			await transaction.commit();

			return findUser;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}
}

module.exports = { UserService };
