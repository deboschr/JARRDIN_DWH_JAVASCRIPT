const DatabaseConnection = require("../config/DatabaseConnection.js");
const MyDB = DatabaseConnection.getConnection();
const { DataTypes } = require("sequelize");

const UserModel = MyDB.define(
	"user",
	{
		user_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		password: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
			defaultValue: "ACTIVE",
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
		tableName: "user",
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

module.exports = { UserModel };
