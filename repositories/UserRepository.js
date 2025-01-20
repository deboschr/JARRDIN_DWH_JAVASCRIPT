const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { Sequelize } = require("sequelize");

const { UserModel } = require("../models/UserModel.js");

class UserRepository {
	static async readAll() {
		try {
			const findUser = await UserModel.findAll({
				order: [["name", "ASC"]],
				attributes: ["user_id", "name", "email", "status"],
				raw: true,
			});

			return findUser;
		} catch (error) {
			throw error;
		}
	}

	static async readOneByEmail(email) {
		try {
			const findUser = await UserModel.findOne({
				where: { email: email, status: "active" },
				attributes: ["user_id", "name", "email", "password"],
				raw: true,
			});

			return findUser;
		} catch (error) {
			throw error;
		}
	}

	static async readOneById(user_id) {
		try {
			const findUser = await UserModel.findOne({
				where: { user_id: user_id },
				raw: true,
				attributes: ["user_id", "name", "email", "status"],
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

	static async update(dataUser) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const findUser = await UserModel.findOne({
				where: { user_id: dataUser.user_id },
			});

			if (!findUser) {
				const newError = new Error(`User not found.`);
				newError.status = 404;
				throw newError;
			}

			await findUser.update(
				{
					name: dataUser.name || findUser.name,
					email: dataUser.email || findUser.email,
					password: dataUser.password || findUser.password,
					status: dataUser.status || findUser.status,
				},
				{ transaction }
			);

			await transaction.commit();

			return findUser;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}

	static async delete(userId) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const findUser = await UserModel.findOne({
				where: { user_id: userId },
			});

			if (!findUser) {
				const newError = new Error(`User not found.`);
				newError.status = 404;
				throw newError;
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

module.exports = { UserRepository };
