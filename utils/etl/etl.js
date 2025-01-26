const { extractData } = require("./extract");
const { transformData } = require("./transform");
const { loadData } = require("./load");
const { connectToDatabase } = require("./connection");

async function runETL(dataJob) {
	// extract data
	const extractedData = await extractData(sourceConn, sourceTable);

	// transform data
	const transformedData = transformData(extractedData);

	// load data
	const loadedData = await loadData(transformedData, targetTable);

	console.log("ETL process completed successfully.");
}

module.exports = { runETL };
