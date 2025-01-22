const mysql = require("mysql2/promise");

async function connectToDatabase(dataDatabase) {
	const connection = await mysql.createConnection({
		host: dataDatabase.host,
		database: dataDatabase.db_name,
		user: dataDatabase.username,
		password: dataDatabase.password,
	});
	return connection;
}

module.exports = { connectToDatabase };
