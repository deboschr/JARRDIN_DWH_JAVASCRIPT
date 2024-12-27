const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { Sequelize } = require("sequelize");

const { JobModel } = require("../models/JobModel");
const { ScheduleManager } = require("../utils/ScheduleManager.js");

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
					source_db: item.source_db,
					source_tables: item.source_tables
						? JSON.parse(item.source_tables)
						: null,
					destination_db: item.destination_db,
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
			transaction = await MyDB.transaction();

			const createJob = await JobModel.create(
				{
					name: dataJob.name,
					time: dataJob.time,
					step: dataJob.step,
					period: dataJob.period,
					source_db: dataJob.source_db,
					source_tables: dataJob.source_tables,
					destination_db: dataJob.destination_db,
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
			transaction = await MyDB.transaction();

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
			transaction = await MyDB.transaction();

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
			transaction = await MyDB.transaction();

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
