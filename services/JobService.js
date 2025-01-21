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
		try {
			const findJob = await JobRepository.readOneByName(dataJob.name);

			if (findJob) {
				const newError = new Error(`Job name already exists.`);
				newError.status = 409;
				throw newError;
			}

			const transaction = await MyDB.transaction();

			const newJob = await JobRepository.create(
				dataJob,
				dataSession,
				transaction
			);

			ScheduleManager.createTask(newJob);

			return newJob;
		} catch (error) {
			throw error;
		}
	}

	static async updateJob(dataJob, dataSession) {
		try {
			const updatedJob = await JobRepository.update(dataJob, dataSession);

			return updatedJob;
		} catch (error) {
			throw error;
		}
	}

	static async deleteJob(jobId) {
		try {
			const updatedJob = await JobRepository.delete(jobId);

			return updatedJob;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = { JobService };
