const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { Sequelize } = require("sequelize");

const { DatabaseModel } = require("../models/DatabaseModel.js");
const { UserModel } = require("../models/UserModel.js");

class DatabaseRepository {
	static async readAll() {
		try {
			const findDatabase = await DatabaseModel.findAll({
				order: [["db_name", "ASC"]],
				attributes: ["database_id", "db_name", "host", "port"],
				raw: true,
			});

			return findDatabase;
		} catch (error) {
			throw error;
		}
	}

	static async readOneById(database_id) {
		try {
			const findDatabase = await DatabaseModel.findOne({
				where: { database_id: database_id },
				raw: true,
				include: [
					{
						model: UserModel,
						required: true,
						attributes: ["name", "email"],
						as: "creator",
					},
					{
						model: UserModel,
						required: true,
						attributes: ["name", "email"],
						as: "updator",
					},
				],
			});

			return findDatabase;
		} catch (error) {
			throw error;
		}
	}

	static async create(dataDatabase) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const createDatabase = await DatabaseModel.create(
				{
					name: dataDatabase.name,
					email: dataDatabase.email,
					password: dataDatabase.password,
				},
				{ transaction }
			);

			await transaction.commit();

			return createDatabase;
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

	static async update(dataDatabase) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const findDatabase = await DatabaseModel.findOne({
				where: { database_id: dataDatabase.database_id },
			});

			if (!findDatabase) {
				const newError = new Error(`Database not found.`);
				newError.status = 404;
				throw newError;
			}

			await findDatabase.update(
				{
					name: dataDatabase.name || findDatabase.name,
					email: dataDatabase.email || findDatabase.email,
					password: dataDatabase.password || findDatabase.password,
					status: dataDatabase.status || findDatabase.status,
				},
				{ transaction }
			);

			await transaction.commit();

			return findDatabase;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}

	static async delete(databaseId) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const findDatabase = await DatabaseModel.findOne({
				where: { database_id: databaseId },
			});

			if (!findDatabase) {
				const newError = new Error(`Database not found.`);
				newError.status = 404;
				throw newError;
			}

			// Menghapus Database dari database
			await findDatabase.destroy({ transaction });

			await transaction.commit();

			return findDatabase;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}
}

module.exports = { DatabaseRepository };
