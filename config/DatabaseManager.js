const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");

class DatabaseManager {
	static CONNECTION;

	constructor() {
		this.db = new Sequelize(
			"jadiinde_jarrdin_dwh",
			"jadiinde_jarrdin_dwh",
			"XV6HFaZvU5FNuJ9EVdLX",
			{
				host: "jadiin-developer.com",
				dialect: "mysql",
				logging: false,
			}
		);

		DatabaseManager.CONNECTION = this.db;
	}

	static getDatabase() {
		return DatabaseManager.CONNECTION;
	}

	static getDatabaseDetail() {
		const db = DatabaseManager.CONNECTION;

		if (db) {
			return db.config;
		} else {
			console.error(`>> Database is not configured.`);
			return null;
		}
	}

	static async authenticate() {
		const db = DatabaseManager.CONNECTION;

		if (!db) {
			console.error(`>> Database is not configured.`);
			return;
		}

		try {
			await db.authenticate();
			console.log(`>> Database connected successfully.`);
		} catch (error) {
			console.error(`>> Error while connecting to database:`, error);
		}
	}

	static async synchronize(isForce) {
		const db = DatabaseManager.CONNECTION;

		if (!db) {
			console.error(`>> Database is not configured.`);
			return;
		}

		if (!isForce || isForce !== true) {
			isForce = false;
		}

		try {
			if (isForce === true) {
				await db.query("SET FOREIGN_KEY_CHECKS = 0");
			}

			await db.sync({
				force: isForce,
			});

			console.log(`>> Database synchronized successfully.`);

			if (isForce === true) {
				await db.query("SET FOREIGN_KEY_CHECKS = 1");
			}
		} catch (error) {
			console.error(`>> Error while synchronizing database:`, error);
		}
	}

	static async closeConnection(dbName) {
		const db = DatabaseManager.CONNECTION[dbName];

		if (!db) {
			console.error(`>> ${dbName} database is not configured.`);
			return;
		}

		try {
			await db.close();
			console.log(`>> Connection to ${dbName} database closed.`);
		} catch (error) {
			console.error(`Error closing connection to ${dbName} database:`, error);
		}
	}
}

module.exports = {
	DatabaseManager,
	Sequelize,
	DataTypes,
	Op,
	QueryTypes,
};
