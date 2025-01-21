const schedule = require("node-schedule");
const { spawn } = require("child_process");
const { JobModel } = require("../models/JobModel");

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
					await etl(dataJob);

					const currDate = new Date().toLocaleString();
					console.log(`Job ${dataJob.name} selesai pada ${currDate}`);
				} catch (etlError) {
					console.error(
						`Error dalam ETL untuk job ${dataJob.name}: ${etlError.message}`
					);
				}
			});

			// Menjadwalkan job
			const newJob = schedule.scheduleJob(
				dataJob.name,
				dataJob.cron,
				async () => {
					console.log(
						`>> Job ${dataJob.name} dijalankan pada:`,
						new Date().toLocaleString()
					);

					const findJob = await JobModel.findOne({
						where: { name: dataJob.name },
					});

					if (!findJob) {
						throw new Error(`Job dengan nama ${dataJob.name} tidak ditemukan.`);
					}

					// Jalankan proses ETL dengan last_execute terbaru
					const pythonProcess = spawn("python3", [
						"python/main.py",
						findJob.name,
					]);

					pythonProcess.stdout.on("data", (data) => {
						console.log(`>> STDOUT: ${data}`);
					});

					pythonProcess.stderr.on("data", (data) => {
						console.error(`>> STDERR: ${data}`);
					});

					pythonProcess.on("error", (error) => {
						console.error(`>> ERROR: ${error.message}`);
					});

					pythonProcess.on("close", async (code) => {
						if (code === 0) {
							// await findJob.update({ count: findJob.count + 1 });
						}
						console.log(`ETL process exited with code: ${code}`);
					});
				}
			);
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
