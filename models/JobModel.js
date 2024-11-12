const { DatabaseManager, DataTypes } = require("../config/DatabaseManager.js");
const DataWarehouseDB = DatabaseManager.getDatabase(process.env.DB_NAME);

const JobModel = DataWarehouseDB.define(
	"job",
	{
		job_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		time: {
			type: DataTypes.TIME,
			allowNull: true,
		},
		step: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		period: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		last_execute: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		source_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		source_tables: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		destination_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		destination_tables: {
			type: DataTypes.JSON,
			allowNull: false,
		},
	},
	{
		tableName: "job",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

module.exports = { JobModel };
