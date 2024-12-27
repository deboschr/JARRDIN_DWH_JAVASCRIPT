const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { DataTypes } = require("sequelize");

const JobModel = MyDB.define(
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
		cron: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		count: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		source_db: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		source_tables: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		destination_db: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		destination_tables: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		duplicate_keys: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		transform_script: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM("ACTIVE", "NONACTIVE"),
			defaultValue: "ACTIVE",
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
