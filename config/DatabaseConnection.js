const { Sequelize } = require("sequelize");

// Membuat instansi Sequelize.
const connection = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS,
	{
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIAL,
		logging: false,
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	}
);

const DatabaseConnection = {
	// Fungsi untuk mendapatkan koneksi yang sudah ada.
	getConnection: () => connection,

	// Fungsi untuk mengautentikasi koneksi.
	authenticate: async () => {
		try {
			await connection.authenticate();
			console.log(`>> ${process.env.DB_NAME} database connected successfully.`);
		} catch (error) {
			console.error(
				`>> Error connecting to ${process.env.DB_NAME} database:`,
				error
			);
		}
	},

	// Fungsi untuk mensinkronkan database.
	synchronize: async (isForce = false) => {
		try {
			const options = isForce ? { force: true } : { alter: true };
			if (connection.getDialect() === "mysql" && isForce) {
				await connection.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
			}
			await connection.sync(options);
			console.log(
				`>> ${process.env.DB_NAME} database synchronized successfully.`
			);
			if (connection.getDialect() === "mysql" && isForce) {
				await connection.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
			}
		} catch (error) {
			console.error(
				`>> Error synchronizing ${process.env.DB_NAME} database:`,
				error
			);
		}
	},

	// Fungsi untuk menutup koneksi.
	close: async () => {
		try {
			await connection.close();
			console.log(`>> Connection to database closed.`);
		} catch (error) {
			console.error(`>> Error closing connection to database:`, error);
		}
	},
};

module.exports = DatabaseConnection;
