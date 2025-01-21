const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { Sequelize } = require("sequelize");

const { JobModel } = require("../models/JobModel.js");
const { UserModel } = require("../models/UserModel.js");
const { DatabaseModel } = require("../models/DatabaseModel.js");

class JobRepository {
	static async readAll() {
		try {
			const findJob = await JobModel.findAll({
				order: [["name", "ASC"]],
				attributes: ["job_id", "name", "cron", "status"],
				raw: true,
			});

			return findJob;
		} catch (error) {
			throw error;
		}
	}

	static async readOneByName(name) {
		try {
			const findJob = await JobModel.findOne({
				where: { name: name },
				raw: true,
				include: [
					{
						model: UserModel,
						required: true,
						attributes: ["name"],
						as: "creator",
					},
					{
						model: UserModel,
						required: false,
						attributes: ["name"],
						as: "updator",
					},
					{
						model: DatabaseModel,
						required: true,
						attributes: ["db_name"],
						as: "source_db",
					},
					{
						model: DatabaseModel,
						required: true,
						attributes: ["db_name"],
						as: "destination_db",
					},
				],
			});

			const formattedResult = findJob
				? {
						job_id: findJob?.job_id,
						name: findJob?.name,
						cron: findJob?.cron,
						source_db: findJob?.source_db.db_name,
						source_tables: findJob?.source_tables,
						destination_db: findJob?.destination_db.db_name,
						destination_tables: findJob?.destination_tables,
						duplicate_keys: findJob?.duplicate_keys,
						transform_script: findJob?.transform_script,
						status: findJob?.status,
						created_by: findJob?.creator?.name,
						created_at: findJob?.created_at,
						updated_by: findJob?.updator?.name,
						updated_at: findJob?.updated_at,
				  }
				: undefined;

			return formattedResult;
		} catch (error) {
			throw error;
		}
	}

	static async readOneById(job_id) {
		try {
			const findJob = await JobModel.findOne({
				where: { job_id: job_id },
				include: [
					{
						model: UserModel,
						required: true,
						attributes: ["name"],
						as: "creator",
					},
					{
						model: UserModel,
						required: false,
						attributes: ["name"],
						as: "updator",
					},
					{
						model: DatabaseModel,
						required: true,
						attributes: ["database_id", "db_name"],
						as: "source_db",
					},
					{
						model: DatabaseModel,
						required: true,
						attributes: ["database_id", "db_name"],
						as: "destination_db",
					},
				],
			});

			const formattedResult = findJob
				? {
						job_id: findJob?.job_id,
						name: findJob?.name,
						cron: findJob?.cron,
						source_db: findJob?.source_db,
						source_tables: findJob?.source_tables
							? JSON.parse(findJob?.source_tables)
							: "",
						destination_db: findJob?.destination_db,
						destination_tables: findJob?.destination_tables
							? JSON.parse(findJob?.destination_tables)
							: "",
						duplicate_keys: findJob?.duplicate_keys
							? JSON.parse(findJob?.duplicate_keys)
							: "",
						transform_script: findJob?.transform_script,
						status: findJob?.status,
						created_by: findJob?.creator?.name,
						created_at: findJob?.created_at,
						updated_by: findJob?.updator?.name,
						updated_at: findJob?.updated_at,
				  }
				: undefined;

			return formattedResult;
		} catch (error) {
			throw error;
		}
	}

	static async create(dataJob, dataSession) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const createJob = await JobModel.create(
				{
					name: dataJob.name,
					cron: dataJob.cron,
					source_db_id: dataJob.source_db_id,
					source_tables: dataJob.source_tables,
					destination_db_id: dataJob.destination_db_id,
					destination_tables: dataJob.destination_tables,
					duplicate_keys: dataJob.duplicate_keys,
					transform_script: dataJob.transform_script,
					created_by: dataSession.user_id,
				},
				{ transaction }
			);

			await transaction.commit();

			return createJob;
		} catch (error) {
			if (transaction) await transaction.rollback();

			if (error instanceof Sequelize.UniqueConstraintError) {
				const newError = new Error(error.errors[0].message);
				newError.status = 400;
				throw newError;
			}

			throw error;
		}
	}

	static async update(dataJob, dataSession) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const findJob = await JobModel.findOne({
				where: { job_id: dataJob.job_id },
			});

			if (!findJob) {
				const newError = new Error(`Job not found.`);
				newError.status = 404;
				throw newError;
			}

			await findJob.update(
				{
					name: dataJob.name || findJob.name,
					cron: dataJob.cron || findJob.cron,
					source_db_id: dataJob.source_db_id || findJob.source_db_id,
					source_tables: dataJob.source_tables || findJob.source_tables,
					destination_db_id:
						dataJob.destination_db_id || findJob.destination_db_id,
					destination_tables:
						dataJob.destination_tables || findJob.destination_tables,
					duplicate_keys: dataJob.duplicate_keys || findJob.duplicate_keys,
					transform_script:
						dataJob.transform_script || findJob.transform_script,
					status: dataJob.status || findJob.status,
					updated_by: dataSession.user_id,
				},
				{ transaction }
			);

			await transaction.commit();

			return findJob;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}

	static async delete(job_id) {
		let transaction;
		try {
			transaction = await MyDB.transaction();

			const findJob = await JobModel.findOne({
				where: { job_id: job_id },
			});

			if (!findJob) {
				const newError = new Error(`Job not found.`);
				newError.status = 404;
				throw newError;
			}

			await findJob.destroy({ transaction });

			await transaction.commit();

			return findJob;
		} catch (error) {
			if (transaction) await transaction.rollback();

			throw error;
		}
	}
}

module.exports = { JobRepository };
