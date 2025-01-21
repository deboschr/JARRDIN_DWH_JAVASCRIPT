const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { DataTypes } = require("sequelize");

const { UserModel } = require("./UserModel.js");
const { DatabaseModel } = require("./DatabaseModel.js");

const JobModel = MyDB.define(
	"job",
	{
		job_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		created_by: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		updated_by: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		source_db_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		destination_db_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
		source_tables: {
			type: DataTypes.JSON,
			allowNull: true,
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
			type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
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

(function () {
	// Relasi Job dan User (creator)
	JobModel.belongsTo(UserModel, {
		foreignKey: "created_by",
		targetKey: "user_id",
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
		as: "creator",
	});

	UserModel.hasMany(JobModel, {
		foreignKey: "created_by",
		sourceKey: "user_id",
		as: "create_job",
	});

	// Relasi Job dan User (updator)
	JobModel.belongsTo(UserModel, {
		foreignKey: "updated_by",
		targetKey: "user_id",
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
		as: "updator",
	});

	UserModel.hasMany(JobModel, {
		foreignKey: "updated_by",
		sourceKey: "user_id",
		as: "update_job",
	});

	// Relasi Job dan Database (source_db)
	JobModel.belongsTo(DatabaseModel, {
		foreignKey: "source_db_id",
		targetKey: "database_id",
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
		as: "source_db",
	});

	DatabaseModel.hasMany(JobModel, {
		foreignKey: "source_db_id",
		sourceKey: "database_id",
		as: "source_job",
	});

	// Relasi Job dan Database (destination_db)
	JobModel.belongsTo(DatabaseModel, {
		foreignKey: "destination_db_id",
		targetKey: "database_id",
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
		as: "destination_db",
	});

	DatabaseModel.hasMany(JobModel, {
		foreignKey: "destination_db_id",
		sourceKey: "database_id",
		as: "destination_job",
	});
})();

module.exports = { JobModel };
