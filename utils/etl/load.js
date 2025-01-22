const { connectToDatabase } = require("./connection");

async function loadData(data, targetTable) {
	const connection = await connectToDatabase();
	const promises = data.map((row) =>
		connection.execute(`INSERT INTO ${targetTable} SET ?`, row)
	);
	await Promise.all(promises);
	connection.end();
}

module.exports = { loadData };
