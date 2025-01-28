const { connectToDatabase } = require("./connection");

async function extractData(dataJob) {
	const connection = await connectToDatabase(dataJob.source_db);
	let extractedData = [];

	for (let tableName of dataJob.source_tables) {
		try {
			// Check available columns in the table
			const [columns] = await connection.execute(
				`SHOW COLUMNS FROM ${tableName} WHERE Field IN ('created_at', 'updated_at', 'loaded_at')`
			);

			// Ensure that at least one relevant time column exists
			if (columns.length === 0) {
				throw new Error(`No valid timestamp column found in ${tableName}`);
			}

			// Retrieve the primary key for the table
			const [primaryKeyInfo] = await connection.execute(
				`SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`
			);

			// Check if a primary key exists
			if (primaryKeyInfo.length === 0) {
				throw new Error(`No primary key found in ${tableName}`);
			}
			let primaryKey = primaryKeyInfo[0].Column_name;

			// Create conditions based on available time columns
			let timeCondition = columns
				.map((column) => `${column.Field} > ?`)
				.join(" OR ");

			const query = `SELECT * FROM ${tableName} WHERE ${timeCondition}`;
			const [rows] = await connection.execute(query, [dataJob.last_execute]);

			const dataTable = {
				table: tableName,
				primary_key: primaryKey,
				data: rows,
			};

			extractedData.push(dataTable);
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	connection.end();

	return extractedData;
}

module.exports = { extractData };
