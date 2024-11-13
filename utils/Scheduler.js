const schedule = require("node-schedule");
const { spawn } = require("child_process");
const { JobModel } = require("../models/JobModel");

class Scheduler {
	static JOBS = {};

	static createTask(dataJob) {
		try {
			let rule = new schedule.RecurrenceRule();

			// Parsing waktu jika periode bukan MINUTE atau HOUR
			if (dataJob.period !== "MINUTE" && dataJob.period !== "HOUR") {
				const [hour, minute, second] = dataJob.time.split(":").map(Number);
				rule.hour = hour;
				rule.minute = minute;
				rule.second = second;
			}

			switch (dataJob.period) {
				case "MINUTE":
					rule.minute = new schedule.Range(0, 59, dataJob.step);
					break;
				case "HOUR":
					rule.hour = new schedule.Range(0, 23, dataJob.step);
					break;
				case "DAY":
					rule.dayOfWeek = new schedule.Range(0, 6, dataJob.step);
					break;
				case "MONTH":
					rule.month = new schedule.Range(0, 11, dataJob.step);
					break;
				case "YEAR":
					rule.year = new Date().getFullYear() + dataJob.step;
					break;
				default:
					throw new Error(
						"Invalid period. Must be 'MINUTE', 'HOUR', 'DAY', 'MONTH', or 'YEAR'."
					);
			}

			// Menjadwalkan job
			const newJob = schedule.scheduleJob(dataJob.name, rule, async () => {
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
						const lastExecute = new Date().toLocaleString();
						await findJob.update({ last_execute: lastExecute });
						console.log(
							`Job ${dataJob.name} berhasil diupdate. last_excute = ${lastExecute}`
						);
					}
					console.log(`ETL process exited with code: ${code}`);
				});
			});

			// Simpan job ke dalam JOBS
			this.JOBS[dataJob.name] = newJob;
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

module.exports = { Scheduler };
