const schedule = require("node-schedule");
const { JobModel } = require("../models/JobModel");
const { DatabaseModel } = require("../models/DatabaseModel");

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
					const findJob = await JobModel.findOne({
						where: { name: dataJob.name },
						attributes: [
							"name",
							"source_tables",
							"destination_tables",
							"duplicate_keys",
							"transform_script",
						],
						include: [
							{
								model: DatabaseModel,
								required: true,
								attributes: ["host", "db_name", "username", "password"],
								as: "source_db",
							},
							{
								model: DatabaseModel,
								required: true,
								attributes: ["host", "db_name", "username", "password"],
								as: "destination_db",
							},
						],
					});

					if (!findJob) {
						throw new Error(`Job dengan nama ${dataJob.name} tidak ditemukan.`);
					}

					await etl(dataJob);

					const currDate = new Date().toLocaleString();
					console.log(`Job ${dataJob.name} selesai pada ${currDate}`);
				} catch (etlError) {
					console.error(
						`Error dalam ETL untuk job ${dataJob.name}: ${etlError.message}`
					);
				}
			});
		} catch (error) {
			throw error;
		}
	}

	static cancelTask(jobName) {
		try {
			const job = this.JOBS[jobName];

			if (job) {
				job.cancel();

				delete this.JOBS[jobName];

				console.log(
					`Job ${jobName} telah dibatalkan dan dihapus dari database.`
				);
			} else {
				console.log(`Job ${jobName} tidak ditemukan di instance JOBS.`);
			}
		} catch (error) {
			throw error;
		}
	}
}

module.exports = { ScheduleManager };
