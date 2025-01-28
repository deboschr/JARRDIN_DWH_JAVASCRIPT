const { extractData } = require("./extract");
const { transformData } = require("./transform");
const { loadData } = require("./load");

const runETL = async (dataJob) => {
	// extract data
	const extractedData = await extractData(dataJob);

	// transform data
	const transformedData = transformData(dataJob, extractedData);

	// load data
	const loadedData = await loadData(dataJob, transformedData);
};

module.exports = { runETL };
