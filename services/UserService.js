const { UserModel } = require("../models/UserModel");
const { Scheduler } = require("../utils/Scheduler");

class UserService {
	static async readAll() {
		try {
			const findUser = await UserModel.findAll({
				order: [["username", "ASC"]],
				raw: true,
				attributes: ["username"],
			});

			return findUser;
		} catch (error) {
			throw error;
		}
	}

	static async readOne(username) {
		try {
			const findUser = await UserModel.findOne({
				where: { username: username },
				raw: true,
			});

			return findUser;
		} catch (error) {
			throw error;
		}
	}
	static async readAll(isReload = false) {
		try {
			const findUser = await UserModel.findAll({
				order: [["name", "ASC"]],
				raw: true,
			});

			// Menjadwal ulang semua User jika reload = true
			if (isReload && findUser.length > 0) {
				findUser.forEach((User) => {
					Scheduler.createTask(User);
				});
			} else if (!isReload) {
				return findUser;
			}
		} catch (error) {
			throw error;
		}
	}

	static async create(dataUser) {
		let transaction;
		try {
			transaction = await SparkDB.transaction();

			const createUser = await UserModel.create(
				{
					username: dataUser.username,
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
			transaction = await SparkDB.transaction();

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
