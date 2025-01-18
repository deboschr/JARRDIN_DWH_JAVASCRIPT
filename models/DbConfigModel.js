const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { DataTypes } = require("sequelize");

const { UserModel } = require("./UserModel.js");

const DbConfigModel = MyDB.define(
	"db_config",
	{
		db_config_id: {
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
		host: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		port: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		db_name: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		password: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
		updated_at: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
	},
	{
		tableName: "db_config",
		timestamps: false,
		hooks: {
			beforeCreate: (data) => {
				data.created_at = new Date().getTime();
			},
			beforeUpdate: (data) => {
				data.updated_at = new Date().getTime();
			},
		},
	}
);

(function () {
	// Relasi DbConfig dan User (creator)
	DbConfigModel.belongsTo(UserModel, {
		foreignKey: "created_by",
		targetKey: "user_id",
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
		as: "creator",
	});

	UserModel.hasMany(DbConfigModel, {
		foreignKey: "created_by",
		sourceKey: "user_id",
		as: "create_db_config",
	});

	// Relasi DbConfig dan User (updator)
	DbConfigModel.belongsTo(UserModel, {
		foreignKey: "updated_by",
		targetKey: "user_id",
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
		as: "updator",
	});

	UserModel.hasMany(DbConfigModel, {
		foreignKey: "updated_by",
		sourceKey: "user_id",
		as: "update_db_config",
	});
})();

module.exports = { DbConfigModel };
