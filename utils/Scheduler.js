const schedule = require("node-schedule");

class Scheduler {
	static JOBS = {};

	static async createTask(dataJob) {
		// Mendefinisikan rule
		const rule = new schedule.RecurrenceRule();

		switch (config.Period) {
			case "MINUTE":
				rule.minute = new schedule.Range(0, 59, config.Step);
				break;
			case "HOUR":
				rule.hour = new schedule.Range(0, 23, config.Step);
				break;
			case "DAY":
				rule.dayOfWeek = new schedule.Range(0, 6, config.Step);
				break;
			case "MONTH":
				rule.month = new schedule.Range(0, 11, config.Step);
				break;
			case "YEAR":
				rule.year = new Date().getFullYear() + config.Step;
				break;
			default:
				throw new Error("Periode tidak valid");
		}

		// Atur endDate pada rule untuk interval
		rule.end = new Date(config.EndDate);

		// UPSERT job ke db here

		// Jadwalkan job
		const newJob = schedule.scheduleJob(dataJob.name, rule, async () => {
			console.log(`Job ${dataJob.name} dijalankan pada:`, new Date());

			// UPSERT job di db here
		});

		// Simpan instance job
		this.JOBS[dataJob.name] = newJob;
	}

	// Fungsi untuk membatalkan job berdasarkan ID
	static async cancelTask(name) {
		// mendapatkan instance job
		const job = this.JOBS[name];

		if (job) {
			// menghentikan job
			job.cancel();

			// menghapus instance job
			delete this.JOBS[name];

			// menghapus job di database
			await JobModel.destroy({ where: { name: name } });

			console.log(`Job ${name} telah dibatalkan dan dihapus dari database.`);
		} else {
			console.log(`Job ${name} tidak ditemukan atau sudah dibatalkan.`);
		}
	}

	// Fungsi untuk memuat ulang job yang belum selesai dari database saat server mulai
	static async loadJobsFromDB() {
		// Mendapatkan semua job dari database
		const activeJobs =
			// Menjadwalkan ulang semua job
			activeJobs.forEach((dataJob) => {
				this.scheduleTask({
					name: dataJob.name,
					time: dataJob.time,
					step: dataJob.step,
					period: dataJob.period,
					Config: JSON.parse(dataJob.Config),
				});
			});
		console.log("Semua job cost telah dimuat ulang dari database.");
	}
}

module.exports = { Scheduler };
