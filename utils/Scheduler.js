const schedule = require("node-schedule");
const { spawn } = require("child_process");
const mysql = require("mysql2");

const connection = mysql.createConnection({
	host: "jadiin-developer.com",
	user: "jadiinde_jarrdin_dwh",
	password: "XV6HFaZvU5FNuJ9EVdLX",
	database: "jadiinde_jarrdin_dwh",
});

class Scheduler {
	static JOBS = {};

	// Fungsi untuk menjadwalkan job
	static async createTask(dataJob) {
		let rule = new schedule.RecurrenceRule();

		// Parsing waktu jika periode bukan MINUTE atau HOUR
		if (dataJob.period !== "MINUTE" && dataJob.period !== "HOUR") {
			const [hour, minute, second] = dataJob.time.split(":").map(Number);
			rule.hour = hour;
			rule.minute = minute;
			rule.second = second;
		}

		rule = this.timeRule(rule, dataJob.step, dataJob.period);

		// Menjadwalkan job
		const newJob = schedule.scheduleJob(dataJob.name, rule, async () => {
			console.log(
				`>> Job ${dataJob.name} dijalankan pada:`,
				new Date().toLocaleString()
			);

			// Ambil nilai last_execute terbaru dari database sebelum menjalankan ETL
			const query = `SELECT name FROM job WHERE name = ?`;
			connection.execute(query, [dataJob.name], (err, results) => {
				if (err) {
					console.error("Error saat mengambil last_execute:", err);
					return;
				}

				// Pastikan ada hasil dan mengambil name
				const jobName = results[0]?.name;
				if (!jobName) {
					console.error(
						`Tidak ditemukan job bernama ${dataJob.name} di database`
					);
					return;
				}

				// Jalankan proses ETL dengan last_execute terbaru
				const pythonProcess = spawn("python3", ["services/etl.py", jobName]);

				pythonProcess.stdout.on("data", (data) => {
					console.log(`stdout: ${data}`);
				});

				pythonProcess.stderr.on("data", (data) => {
					console.error(`stderr: ${data}`);
				});

				pythonProcess.on("error", (error) => {
					console.error(`Eksekusi gagal: ${error.message}`);
				});

				pythonProcess.on("close", (code) => {
					if (code === 0) {
						// Hanya perbarui last_execute jika proses ETL berhasil
						const updateQuery = `UPDATE job SET last_execute = ? WHERE name = ?`;
						const updateValues = [new Date(), dataJob.name];

						connection.execute(updateQuery, updateValues, (err, results) => {
							if (err) {
								console.error("Error saat update job:", err);
							} else {
								console.log(`>> Job ${dataJob.name} berhasil diupdate.`);
							}
						});
					}
					console.log(`ETL process exited with code: ${code}`);
				});
			});
		});

		// Simpan job ke dalam JOBS
		this.JOBS[dataJob.name] = newJob;

		if (dataJob.status === "NEW") {
			// Insert atau update job di database
			const query = `
      		INSERT INTO job (name, time, step, period, last_execute, config) 
      		VALUES (?, ?, ?, ?, ?, ?) 
      		ON DUPLICATE KEY UPDATE 
        			time = VALUES(time), 
        			step = VALUES(step), 
        			period = VALUES(period), 
        			last_execute = VALUES(last_execute),
        			config = VALUES(config)
    			`;

			const values = [
				dataJob.name,
				dataJob.time,
				dataJob.step,
				dataJob.period,
				dataJob.last_execute,
				JSON.stringify(dataJob.config),
			];

			connection.execute(query, values, (err, results) => {
				if (err) {
					console.error("Error saat menyimpan job:", err);
				} else {
					console.log(
						`>> Job ${dataJob.name} berhasil dijadwalkan dan disimpan.`
					);
				}
			});
		}
	}

	// Method untuk membatalkan dan menghapus task berdasarkan jobId
	static async cancelTask(jobId) {
		return new Promise((resolve, reject) => {
			// Pertama, ambil jobName berdasarkan jobId
			const selectQuery = `SELECT name FROM job WHERE job_id = ?`;
			connection.execute(selectQuery, [jobId], (err, results) => {
				if (err) {
					console.error("Error saat mengambil job:", err);
					return reject(err);
				}

				if (results.length === 0) {
					console.log(`Job dengan ID ${jobId} tidak ditemukan.`);
					return resolve(`Job dengan ID ${jobId} tidak ditemukan.`);
				}

				const jobName = results[0].name; // Ambil jobName dari hasil query

				// Setelah mendapatkan jobName, lanjutkan dengan menghapus job dari database
				const deleteQuery = `DELETE FROM job WHERE job_id = ?`;
				connection.execute(deleteQuery, [jobId], (deleteErr, deleteResults) => {
					if (deleteErr) {
						console.error("Error saat menghapus job:", deleteErr);
						return reject(deleteErr);
					}

					// Hentikan dan hapus job dari instance JOBS
					const job = this.JOBS[jobName];
					if (job) {
						job.cancel();
						delete this.JOBS[jobName];
						console.log(
							`Job ${jobName} telah dibatalkan dan dihapus dari database.`
						);
						resolve(
							`Job ${jobName} telah dibatalkan dan dihapus dari database.`
						);
					} else {
						console.log(`Job ${jobName} tidak ditemukan di instance JOBS.`);
						resolve(
							`Job ${jobName} tidak ditemukan di instance JOBS, tetapi sudah dihapus dari database.`
						);
					}
				});
			});
		});
	}

	// Fungsi untuk memuat ulang job dari database saat server mulai
	static async loadJobsFromDB() {
		const query = `SELECT * FROM job`;

		connection.execute(query, (err, activeJobs) => {
			if (err) {
				console.error("Error saat memuat ulang job:", err);
				return;
			}

			// Menjadwalkan ulang semua job berdasarkan data yang diambil dari database
			activeJobs.forEach((dataJob) => {
				this.createTask({
					name: dataJob.name,
					time: dataJob.time,
					step: dataJob.step,
					period: dataJob.period,
					config: JSON.parse(dataJob.config),
					last_execute: dataJob.last_execute,
					status: "OLD",
				});
			});

			console.log(">> Semua job telah dimuat ulang dari database.");
		});
	}

	// Fungsi untuk mendapatkan waktu eksekusi terakhir
	static timeRule(rule, step, period) {
		switch (period) {
			case "MINUTE":
				rule.minute = new schedule.Range(0, 59, step);
				break;
			case "HOUR":
				rule.hour = new schedule.Range(0, 23, step);
				break;
			case "DAY":
				rule.dayOfWeek = new schedule.Range(0, 6, step);
				break;
			case "MONTH":
				rule.month = new schedule.Range(0, 11, step);
				break;
			case "YEAR":
				rule.year = new Date().getFullYear() + step;
				break;
			default:
				throw new Error(
					"Invalid period. Must be 'MINUTE', 'HOUR', 'DAY', 'MONTH', or 'YEAR'."
				);
		}

		return rule;
	}

	static readAll() {
		return new Promise((resolve, reject) => {
			const query = `SELECT * FROM job`;

			connection.execute(query, (err, job) => {
				if (err) {
					console.error("Error saat memuat ulang job:", err);
					return reject(err);
				}

				const results = [];
				// Menjadwalkan ulang semua job berdasarkan data yang diambil dari database
				job.forEach((item) => {
					results.push({
						job_id: item.job_id,
						name: item.name,
						time: item.time,
						step: item.step,
						period: item.period,
						last_execute: item.last_execute,
						config: JSON.parse(item.config),
					});
				});

				resolve(results);
			});
		});
	}
}

module.exports = { Scheduler };
