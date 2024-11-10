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
		const rule = new schedule.RecurrenceRule();
		// Parsing time dari dataJob.time
		const [hour, minute, second] = dataJob.time.split(":").map(Number);
		rule.hour = hour;
		rule.minute = minute;
		rule.second = second;

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
				throw new Error("Periode tidak valid");
		}

		// Menjadwalkan job
		const newJob = schedule.scheduleJob(dataJob.name, rule, async () => {
			console.log(`Job ${dataJob.name} dijalankan pada:`, new Date());

			const source = dataJob.config.source;
			const target = dataJob.config.target;
			const lastExecuteTime = 0;

			exec(
				`python3 services/etl.py ${source} ${target} ${lastExecuteTime}`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`Eksekusi gagal: ${stderr}`);
						return;
					}
					console.log(stdout);
				}
			);
		});

		// Simpan job ke dalam JOBS
		this.JOBS[dataJob.name] = newJob;

		if (dataJob.type === "NEW") {
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
					console.log(`Job ${dataJob.name} berhasil dijadwalkan dan disimpan.`);
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
			console.log(`Job ${name} tidak ditemukan atau sudah dibatalkan.`);
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
					type: "OLD",
				});
			});

			console.log("Semua job telah dimuat ulang dari database.");
		});
	}
}

module.exports = { Scheduler };
