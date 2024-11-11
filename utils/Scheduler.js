const schedule = require("node-schedule");
const { spawn } = require("child_process");
const mysql = require("mysql2");

const dbConfig = {
	host: "jadiin-developer.com",
	user: "jadiinde_jarrdin_dwh",
	password: "XV6HFaZvU5FNuJ9EVdLX",
	database: "jadiinde_jarrdin_dwh",
};
const connection = mysql.createConnection(dbConfig);

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

			const source = dataJob.config.source;
			const target = dataJob.config.target;
			const lastExecuteTime = dataJob.last_execute;

			const pythonProcess = spawn("python3", [
				"services/etl.py",
				source,
				target,
				lastExecuteTime,
			]);

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
				console.log(`ETL process exited with code: ${code}`);
			});

			// Update last_execute di database setelah job dijalankan
			const query = `UPDATE job SET last_execute = ? WHERE name = ?`;
			const values = [new Date(), dataJob.name];

			connection.execute(query, values, (err, results) => {
				if (err) {
					console.error("Error saat update job:", err);
				} else {
					console.log(`>> Job ${dataJob.name} berhasil diupdate.`);
				}
			});
		});

		// Simpan job ke dalam JOBS
		this.JOBS[dataJob.name] = newJob;

		if (dataJob.status === "NEW") {
			// Insert atau update job di database
			const query = `
        INSERT INTO job (name, time, step, period, config, last_execute) 
        VALUES (?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
          time = VALUES(time), 
          step = VALUES(step), 
          period = VALUES(period), 
          config = VALUES(config),
          last_execute = VALUES(last_execute)
      `;

			const values = [
				dataJob.name,
				dataJob.time,
				dataJob.step,
				dataJob.period,
				JSON.stringify(dataJob.config),
				new Date(),
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

	// Fungsi untuk membatalkan job berdasarkan nama
	static async cancelTask(name) {
		const job = this.JOBS[name];

		if (job) {
			// Hentikan job
			job.cancel();

			// Hapus job dari JOBS
			delete this.JOBS[name];

			// Hapus job dari database
			const query = `DELETE FROM job WHERE name = ?`;
			connection.execute(query, [name], (err, results) => {
				if (err) {
					console.error("Error saat menghapus job:", err);
				} else {
					console.log(
						`Job ${name} telah dibatalkan dan dihapus dari database.`
					);
				}
			});
		} else {
			console.log(`>> Job ${name} tidak ditemukan atau sudah dibatalkan.`);
		}
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
}

module.exports = { Scheduler };
