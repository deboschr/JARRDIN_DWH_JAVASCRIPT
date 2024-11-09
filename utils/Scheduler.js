const schedule = require("node-schedule");
const { JobModel } = require("../../database/models/JobModel");
const { CostModel } = require("../../database/models/CostModel");
const { CostInvoiceModel } = require("../../database/models/CostInvoiceModel");
const { getNextDueDate } = require("../getNextDueDate");

class Scheduler {
	static JOBS = {};

	// Fungsi untuk menjadwalkan Job yang hanya dilakukan satu kali
	static async scheduleTask(dataJob, dataUser) {
		// jika EndDate lebih besar dari waktu saat ini maka jangan buat job
		if (dataJob.Config.DueDate > new Date().getTime()) {
			return;
		}

		let rule;
		if (dataJob.Type === "ONETIME") {
			rule = new Date(dataJob.Config.DueDate);
		} else if (dataJob.Type === "INTERVAL") {
			if (dataJob.Status === "OLD") {
				// Dapatkan duedate
				const dueDate = await this._getNextDueDate(dataJob);

				// Jika duedate lebih besar dari enddate maka jangan buat job
				if (dueDate > dataJob.Config.EndDate) {
					return;
				}

				// Buat dataJob baru dengan tipe ONETIME sehingga waktu eksekusi job tetap presisi
				dataJob = {
					CostID: dataJob.CostID,
					Name: dataJob.Name,
					Type: "ONETIME",
					Config: {
						DueDate: dueDate,
					},
					Status: "NEW",
				};

				// Membuat rule ONETIME
				rule = new Date(dataJob.Config.DueDate);
			} else if (dataJob.Status === "NEW") {
				// Mendapatkan rule INTERVAL
				rule = this._getRuleInterval(dataJob.Config);
			}
		}

		// Jika dataJob berstatus baru maka harus di simpan ke database
		if (dataJob.Status === "NEW") {
			await JobModel.upsert({
				JobID: dataJob.CostID,
				OutletID: dataUser.OutletID,
				Name: dataJob.Name,
				Config: JSON.stringify(dataJob.Config),
				Type: dataJob.Type,
			});
		}

		// Jadwalkan job
		const newJob = schedule.scheduleJob(dataJob.CostID, rule, async () => {
			console.log(`Job ${dataJob.CostID} dijalankan pada:`, new Date());

			if (dataJob.Type === "ONETIME") {
				// Hapus job
				await this.cancelTask(dataJob.CostID);

				// Dapatkan cost periodic dari database
				const findCost = await CostModel.findOne({
					where: { CostID: dataJob.CostID, Status: "ACTIVE" },
					attributes: ["OutletID", "CostID", "Step", "Period", "EndDate"],
				});

				if (!findCost) {
					console.log("Cost tidak ditemukan.");
					return;
				}

				// Menjadwalkan job interval
				this.scheduleTask(
					{
						ID: findCost.CostID,
						Name: "COST",
						Type: "INTERVAL",
						Config: {
							Step: findCost.Step,
							Period: findCost.Period,
							EndDate: findCost.EndDate,
						},
						Status: "NEW",
					},
					{
						OutletID: findCost.OutletID,
					}
				);
			} else if (dataJob.Type === "INTERVAL") {
				if (new Date() >= dataJob.Config.EndDate) {
					// Hapus job jika sudah mencapat batas waktu
					await this.cancelTask(dataJob.CostID);
				} else {
					// Mendapatkan duedate
					const dueDate = await this._getNextDueDate(dataJob);

					// Membuat cost invoice baru
					await CostInvoiceModel.create({
						CostID: findCostInvoice.CostID,
						DueDate: dueDate,
						Amount: findCostInvoice.Amount,
					});
				}
			} else {
				throw new Error("Tipe job tidak valid");
			}
		});

		// Simpan instance job
		this.JOBS[dataJob.CostID] = newJob;
	}

	// Fungsi untuk membatalkan job berdasarkan ID
	static async cancelTask(jobId) {
		// mendapatkan instance job
		const job = this.JOBS[jobId];

		if (job) {
			// menghentikan job
			job.cancel();

			// menghapus instance job
			delete this.JOBS[jobId];

			// menghapus job di database
			await JobModel.destroy({ where: { JobID: jobId } });

			console.log(`Job ${jobId} telah dibatalkan dan dihapus dari database.`);
		} else {
			console.log(`Job ${jobId} tidak ditemukan atau sudah dibatalkan.`);
		}
	}

	// Fungsi untuk memuat ulang job yang belum selesai dari database saat server mulai
	static async loadJobsFromDB() {
		// Mendapatkan semua job dari database
		const activeJobs = await JobModel.findAll({
			where: { Name: "COST" },
			raw: true,
			attributes: ["JobID", "Name", "Type", "Config"],
		});

		// Menjadwalkan ulang semua job
		activeJobs.forEach((dataJob) => {
			this.scheduleTask(
				{
					CostID: dataJob.JobID,
					Name: dataJob.Name,
					Type: dataJob.Type,
					Config: JSON.parse(dataJob.Config),
					Status: "OLD",
				},
				{
					OutletID: dataJob.OutletID,
				}
			);
		});
		console.log("Semua job cost telah dimuat ulang dari database.");
	}

	_getRuleInterval(config) {
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

		return rule;
	}

	async _getNextDueDate(dataJob) {
		// Mengambil CostInvoice terakhir
		const findCostInvoice = await CostInvoiceModel.findOne({
			sort: ["CreateAt"],
			where: { CostID: dataJob.CostID },
			attributes: ["CostID", "DueDate", "Amount"],
			include: [
				{
					model: CostModel,
					attributes: ["CostID"],
					required: true,
					where: {
						Status: "ACTIVE",
					},
				},
			],
		});

		if (!findCostInvoice) {
			console.log("CostInvoice tidak ditemukan.");
			return;
		}

		// Mendapatkan duedate berikutnya
		const currDueDate = findCostInvoice.DueDate;
		const nextDueDate = getNextDueDate(
			currDueDate,
			dataJob.Config.Period,
			dataJob.Config.Step
		);

		return nextDueDate;
	}
}

module.exports = { Scheduler };
