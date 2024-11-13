const { DatabaseManager, DataTypes } = require("../config/DatabaseManager.js");
const DataWarehouseDB = DatabaseManager.getDatabase();

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
			type: DataTypes.ENUM("MINUTE", "HOUR", "DAY", "MONTH", "YEAR"),
			allowNull: false,
		},
		count: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		source_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		source_tables: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		destination_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		destination_tables: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		duplicate_key: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		tableName: "job",
		timestamps: false,
	}
);

module.exports = { JobModel };
