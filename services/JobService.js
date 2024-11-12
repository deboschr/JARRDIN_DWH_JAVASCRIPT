const { JobModel } = require("../models/JobModel");
const { Scheduler } = require("../utils/Scheduler");

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
					Scheduler.createTask(job);
				});
			}

			return findJob;
		} catch (error) {
			throw error;
		}
	}

	static async create(dataJob, dataUser) {
		let transaction;
		try {
			transaction = await SparkDB.transaction();

			const createJob = await JobModel.create(
				{
					name: dataJob.name,
					time: dataJob.time,
					step: dataJob.step,
					period: dataJob.period,
					last_execute: dataJob.start_date,
					source_name: dataJob.source_name,
					source_tables: dataJob.source_tables,
					destination_name: dataJob.destination_name,
					destination_tables: dataJob.destination_tables,
					created_by: dataUser.user_id,
				},
				{ transaction }
			);

			// Menjadwalkan job
			Scheduler.createTask(createJob);

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

	static async delete(jobId) {
		let transaction;
		try {
			transaction = await SparkDB.transaction();

			const findJob = await JobModel.finOne({
				where: { job_id: jobId },
			});

			if (!findJob) {
				throw new Error(`Job tidak ditemukan.`);
			}

			// Menghentikan job dari penjadwalan
			Scheduler.cancelTask(findJob.name);

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
