const schedule = require("node-schedule");
const { JobRepository } = require("../repositories/JobRepository.js");
const { runETL } = require("./etl/etl.js");
class ScheduleManager {
	static createTask(dataJob) {
		try {
			if (schedule.scheduledJobs[dataJob.name]) {
				const newError = new Error(
					`Job with name ${dataJob.name} already exists`
				);
				newError.code = 409;
				throw newError;
			}

			const job = schedule.scheduleJob(dataJob.name, dataJob.cron, async () => {
				try {
					const findJob = await JobRepository.readOneByName(identifier.name);

					if (!findJob) {
						const newError = new Error(`Job not found.`);
						newError.status = 404;
						throw newError;
					}

					if (findJob.status === "INACTIVE") {
						this.cancelTask(findJob.name);
					}

					await runETL(dataJob);

					console.log(
						`## Job[${dataJob.name}] - ${new Date().toLocaleString()}`
					);
				} catch (error) {
					throw error;
				}
			});
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	static cancelTask(jobName) {
		try {
			if (!schedule.scheduledJobs[jobName]) {
				const newError = new Error(`Job not found.`);
				newError.status = 404;
				throw newError;
			}

			const job = schedule.scheduledJobs[jobName];

			job.cancel();
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
}

module.exports = { ScheduleManager };
