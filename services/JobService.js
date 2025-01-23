const { JobRepository } = require("../repositories/JobRepository.js");
const { ScheduleManager } = require("../utils/ScheduleManager.js");
const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();

class JobService {
	static async findJob(identifier) {
		try {
			let findJob;
			if (identifier?.name) {
				findJob = await JobRepository.readOneByName(identifier.name);
			} else if (identifier?.job_id) {
				findJob = await JobRepository.readOneById(identifier.job_id);
			} else {
				findJob = await JobRepository.readAll();
			}

			if (!findJob) {
				const newError = new Error(`Job not found.`);
				newError.status = 404;
				throw newError;
			}

			return findJob;
		} catch (error) {
			throw error;
		}
	}

	static async createJob(dataJob, dataSession) {
		const transaction = await MyDB.transaction();

		try {
			const findJob = await JobRepository.readOneByName(dataJob.name);

			if (findJob) {
				const newError = new Error(`Job name already exists.`);
				newError.status = 409;
				throw newError;
			}

			const newJob = await JobRepository.create(
				dataJob,
				dataSession,
				transaction
			);

			ScheduleManager.createTask(newJob);

			await transaction.commit();

			return newJob;
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}

			throw error;
		}
	}

	static async updateJob(dataJob, dataSession) {
		const transaction = await MyDB.transaction();

		try {
			const updatedJob = await JobRepository.update(
				dataJob,
				dataSession,
				transaction
			);

			ScheduleManager.cancelTask(updatedJob.name);
			ScheduleManager.createTask(updatedJob);

			await transaction.commit();

			return updatedJob;
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}

			throw error;
		}
	}

	static async deleteJob(jobId) {
		const transaction = await MyDB.transaction();

		try {
			const deletedJob = await JobRepository.delete(jobId);

			ScheduleManager.cancelTask(deletedJob.name);

			return deletedJob;
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}

			throw error;
		}
	}
}

module.exports = { JobService };
