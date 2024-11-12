const { UserModel } = require("../models/UserModel");
const { Scheduler } = require("../utils/Scheduler");

class UserService {
	static async read(isReload = false) {
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

	static async create(dataUser, dataSession) {
		let transaction;
		try {
			transaction = await SparkDB.transaction();

			const createUser = await UserModel.create(
				{
					name: dataUser.name,
					time: dataUser.time,
					step: dataUser.step,
					period: dataUser.period,
					last_execute: dataUser.start_date,
					source_name: dataUser.source_name,
					source_tables: dataUser.source_tables,
					destination_name: dataUser.destination_name,
					destination_tables: dataUser.destination_tables,
					created_by: dataUser.user_id,
				},
				{ transaction }
			);

			// Menjadwalkan User
			Scheduler.createTask(createUser);

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

	static async delete(UserId) {
		let transaction;
		try {
			transaction = await SparkDB.transaction();

			const findUser = await UserModel.finOne({
				where: { User_id: UserId },
			});

			if (!findUser) {
				throw new Error(`User tidak ditemukan.`);
			}

			// Menghentikan User dari penjadwalan
			Scheduler.cancelTask(findUser.name);

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
