const schedule = require("node-schedule");
const { exec } = require("child_process");

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

		if (dataJob.period !== "MINUTE" && dataJob.period !== "HOUR") {
			// Parsing time dari dataJob.time
			const [hour, minute, second] = dataJob.time.split(":").map(Number);
			rule.hour = hour;
			rule.minute = minute;
			rule.second = second;
		}

		rule = this.timeRule(rule, dataJob.step, dataJob.period, "job");

		// Menjadwalkan job
		const newJob = schedule.scheduleJob(dataJob.name, rule, async () => {
			console.log(
				`>> Job ${dataJob.name} dijalankan pada:`,
				new Date().toLocaleString()
			);

			const source = dataJob.config.source;
			const target = dataJob.config.target;
			const lastExecuteTime = this.timeRule(
				new Date(),
				dataJob.step,
				dataJob.period,
				"date"
			).toISOString();
			// .toLocaleString();

			console.log("lastExecuteTime", lastExecuteTime);

			exec(
				`python3 services/etl.py ${source} ${target} ${lastExecuteTime}`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`Eksekusi gagal: ${error}`);
						return;
					}
					console.log(stdout);
				}
			);
		});

		// Simpan job ke dalam JOBS
		this.JOBS[dataJob.name] = newJob;

		if (dataJob.status === "NEW") {
			// Insert atau update job di database
			const query = `
				INSERT INTO job (name, time, step, period, config) 
				VALUES (?, ?, ?, ?, ?) 
				ON DUPLICATE KEY UPDATE 
					time = VALUES(time), 
					step = VALUES(step), 
					period = VALUES(period), 
					config = VALUES(config)
				`;

			const values = [
				dataJob.name,
				dataJob.time,
				dataJob.step,
				dataJob.period,
				JSON.stringify(dataJob.config),
			];

			connection.execute(query, values, (err, results) => {
				if (err) {
					console.error("Error saat menyimpan job:", err);
				} else {
					console.log(
						`>> Job ${dataJob.name} berhasil dijadwalkan dan disimpan.`
					);
					return results;
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
					status: "OLD",
				});
			});

			console.log(">> Semua job telah dimuat ulang dari database.");
		});
	}

	// Fungsi untuk mendapatkan waktu eksekusi terakhir
	static timeRule(date, step, period, type) {
		if (type === "date") period = "HOUR";

		const periodActions = {
			MINUTE: {
				job: () => (date.minute = new schedule.Range(0, 59, step)),
				date: () => date.setMinutes(date.getMinutes() - step),
			},
			HOUR: {
				job: () => (date.hour = new schedule.Range(0, 23, step)),
				date: () => date.setHours(date.getHours() - step),
			},
			DAY: {
				job: () => (date.dayOfWeek = new schedule.Range(0, 6, step)),
				date: () => date.setDate(date.getDate() - step),
			},
			MONTH: {
				job: () => (date.month = new schedule.Range(0, 11, step)),
				date: () => date.setMonth(date.getMonth() - step),
			},
			YEAR: {
				job: () => (date.year = new Date().getFullYear() + step),
				date: () => date.setFullYear(date.getFullYear() - step),
			},
		};

		const actionType = type === "job" ? "job" : "date";
		const periodAction = periodActions[period];

		if (!periodAction) {
			throw new Error(
				"Invalid period. Must be 'MINUTE', 'HOUR', 'DAY', 'MONTH', or 'YEAR'."
			);
		}

		periodAction[actionType]();

		return date;
	}
}

module.exports = { Scheduler };
