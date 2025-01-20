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
				attributes: ["database_id", "db_name", "username", "host", "port"],
				raw: true,
			});

			return findDatabase;
		} catch (error) {
			throw error;
		}
	}

	static async readOneByName(db_name) {
		try {
			const findDatabase = await DatabaseModel.findOne({
				where: { db_name: db_name },
				raw: true,
				include: [
					{
						model: UserModel,
						required: true,
						attributes: ["name"],
						as: "creator",
					},
					{
						model: UserModel,
						required: false,
						attributes: ["name"],
						as: "updator",
					},
				],
			});

			const formattedResult = findDatabase
				? {
						database_id: findDatabase?.database_id,
						db_name: findDatabase?.db_name,
						username: findDatabase?.username,
						password: findDatabase?.password,
						host: findDatabase?.host,
						port: findDatabase?.port,
						created_by: findDatabase?.creator?.name,
						created_at: findDatabase?.created_at,
						updated_by: findDatabase?.updator?.name,
						updated_at: findDatabase?.updated_at,
				  }
				: undefined;

			return formattedResult;
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
						attributes: ["name"],
						as: "creator",
					},
					{
						model: UserModel,
						required: false,
						attributes: ["name"],
						as: "updator",
					},
				],
			});

			const formattedResult = findDatabase
				? {
						database_id: findDatabase?.database_id,
						db_name: findDatabase?.db_name,
						username: findDatabase?.username,
						password: findDatabase?.password,
						host: findDatabase?.host,
						port: findDatabase?.port,
						created_by: findDatabase?.creator?.name,
						created_at: findDatabase?.created_at,
						updated_by: findDatabase?.updator?.name,
						updated_at: findDatabase?.updated_at,
				  }
				: undefined;

			return formattedResult;
		} catch (error) {
			throw error;
		}
	}

	static async create(dataDatabase, dataSession) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const createDatabase = await DatabaseModel.create(
				{
					db_name: dataDatabase.db_name,
					username: dataDatabase.username,
					password: dataDatabase.password,
					host: dataDatabase.host,
					port: dataDatabase.port,
					created_by: dataSession.user_id,
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

	static async update(dataDatabase, dataSession) {
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
					db_name: dataDatabase.db_name || findDatabase.db_name,
					username: dataDatabase.username || findDatabase.username,
					password: dataDatabase.password || findDatabase.password,
					host: dataDatabase.host || findDatabase.host,
					port: dataDatabase.port || findDatabase.port,
					updated_by: dataSession.user_id,
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
