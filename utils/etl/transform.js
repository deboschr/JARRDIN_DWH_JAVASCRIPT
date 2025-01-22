function transformData(data) {
	// Implementasi transformasi data
	return data.map((row) => ({
		...row,
		transformedColumn: `Transformed-${row.originalColumn}`,
	}));
}

module.exports = { transformData };
