const { connectToDatabase } = require("./connection");

async function extractData(tableName) {
	const connection = await connectToDatabase();
	const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
	connection.end();
	return rows;
}

module.exports = { extractData };
