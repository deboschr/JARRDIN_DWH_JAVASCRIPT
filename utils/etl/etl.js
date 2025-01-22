const { extractData } = require("./extract");
const { transformData } = require("./transform");
const { loadData } = require("./load");

async function runETL(dataJob) {

   

	const extractedData = await extractData(sourceTable);
	const transformedData = transformData(extractedData);
	const loadedData = await loadData(transformedData, targetTable);

	console.log("ETL process completed successfully.");
}

module.exports = { runETL };
