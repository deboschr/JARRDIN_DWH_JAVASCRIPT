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
		count: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		period: {
			type: DataTypes.ENUM("MINUTE", "HOUR", "DAY", "MONTH", "YEAR"),
			allowNull: false,
		},
		trigger: {
			type: DataTypes.INTEGER,
			allowNull: true,
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
