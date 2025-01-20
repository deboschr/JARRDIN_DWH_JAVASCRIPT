const { DatabaseRepository } = require("../repositories/DatabaseRepository.js");

class DatabaseService {
	static async findDatabase(identifier) {
		try {
			let findDatabase;
			if (identifier?.db_name) {
				findDatabase = await DatabaseRepository.readOneByName(
					identifier.db_name
				);
			} else if (identifier?.database_id) {
				findDatabase = await DatabaseRepository.readOneById(
					identifier.database_id
				);
			} else {
				findDatabase = await DatabaseRepository.readAll();
			}

			if (!findDatabase) {
				const newError = new Error(`Database not found.`);
				newError.status = 404;
				throw newError;
			}

			return findDatabase;
		} catch (error) {
			throw error;
		}
	}

	static async createDatabase(dataDatabase, dataSession) {
		try {
			const findDatabase = await DatabaseRepository.readOneByName(
				dataDatabase.db_name
			);

			if (findDatabase) {
				const newError = new Error(`Database name already exists.`);
				newError.status = 409;
				throw newError;
			}

			const newDatabase = await DatabaseRepository.create(
				dataDatabase,
				dataSession
			);

			return newDatabase;
		} catch (error) {
			throw error;
		}
	}

	static async updateDatabase(dataDatabase, dataSession) {
		try {
			const updatedDatabase = await DatabaseRepository.update(
				dataDatabase,
				dataSession
			);

			return updatedDatabase;
		} catch (error) {
			throw error;
		}
	}

	static async deleteDatabase(databaseId) {
		try {
			const updatedDatabase = await DatabaseRepository.delete(databaseId);

			return updatedDatabase;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = { DatabaseService };
