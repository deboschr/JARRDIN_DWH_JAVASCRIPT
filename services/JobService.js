const { JobModel } = require("../models/JobModel");
const { ScheduleManager } = require("../utils/ScheduleManager.js");
const {
	DatabaseManager,
	Sequelize,
	Op,
} = require("../config/DatabaseManager.js");
const DataWarehouseDB = DatabaseManager.getDatabase();

class JobService {
	static async read(isReload = false) {
		try {
			const findJob = await JobModel.findAll({
				order: [["name", "ASC"]],
				raw: true,
			});

			// Menjadwal ulang semua job jika reload = true
			if (isReload && findJob.length > 0) {
				findJob.forEach((job) => {
					ScheduleManager.createTask(job);
				});
				console.log(">> Job berhasil di reload.");
			} else if (!isReload) {
				const formattedResult = findJob.map((item) => ({
					job_id: item.job_id,
					name: item.name,
					time: item.time,
					step: item.step,
					period: item.period,
					count: item.count,
					last_execute: item.updated_at,
					source_name: item.source_name,
					source_tables: item.source_tables
						? JSON.parse(item.source_tables)
						: null,
					destination_name: item.destination_name,
					destination_tables: item.destination_tables
						? JSON.parse(item.destination_tables)
						: null,
					duplicate_keys: item.duplicate_keys
						? JSON.parse(item.duplicate_keys)
						: null,
					status: item.status,
				}));

				return formattedResult;
			}
		} catch (error) {
			throw error;
		}
	}

	static async create(dataJob) {
		let transaction;
		try {
			transaction = await DataWarehouseDB.transaction();

			const createJob = await JobModel.create(
				{
					name: dataJob.name,
					time: dataJob.time,
					step: dataJob.step,
					period: dataJob.period,
					source_name: dataJob.source_name,
					source_tables: dataJob.source_tables,
					destination_name: dataJob.destination_name,
					destination_tables: dataJob.destination_tables,
					duplicate_keys: dataJob.duplicate_keys,
					updated_at: dataJob.last_execute,
				},
				{ transaction }
			);

			// Menjadwalkan job
			ScheduleManager.createTask(createJob);

			await transaction.commit();

			return createJob;
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

	static async activate(jobId) {
		let transaction;
		try {
			transaction = await DataWarehouseDB.transaction();

			const findJob = await JobModel.findOne({
				where: { job_id: jobId },
			});

			if (!findJob) {
				throw new Error(`Job tidak ditemukan.`);
			}

			// Menambahkan job ke penjadwalan
			ScheduleManager.createTask(findJob.name);

			// Menghapus job dari database
			await findJob.update({ status: "ACTIVE" }, { transaction });

			await transaction.commit();

			return findJob;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}

	static async nonactivate(jobId) {
		let transaction;
		try {
			transaction = await DataWarehouseDB.transaction();

			const findJob = await JobModel.findOne({
				where: { job_id: jobId },
			});

			if (!findJob) {
				throw new Error(`Job tidak ditemukan.`);
			}

			// Menghentikan job dari penjadwalan
			ScheduleManager.cancelTask(findJob.name);

			// Menghapus job dari database
			await findJob.update({ status: "NONACTIVE" }, { transaction });

			await transaction.commit();

			return findJob;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}

	static async delete(jobId) {
		let transaction;
		try {
			transaction = await DataWarehouseDB.transaction();

			const findJob = await JobModel.findOne({
				where: { job_id: jobId },
			});

			if (!findJob) {
				throw new Error(`Job tidak ditemukan.`);
			}

			// Menghentikan job dari penjadwalan
			ScheduleManager.cancelTask(findJob.name);

			// Menghapus job dari database
			await findJob.destroy({ transaction });

			await transaction.commit();

			return findJob;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}
}

module.exports = { JobService };
