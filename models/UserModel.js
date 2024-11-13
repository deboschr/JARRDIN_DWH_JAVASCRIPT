const { DatabaseManager, DataTypes } = require("../config/DatabaseManager.js");
const DataWarehouseDB = DatabaseManager.getDatabase(process.env.DB_NAME);

const UserModel = DataWarehouseDB.define(
	"user",
	{
		user_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		username: {
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
			type: DataTypes.DATE,
			allowNull: true,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		tableName: "user",
		timestamps: false,
	}
);

module.exports = { UserModel };
