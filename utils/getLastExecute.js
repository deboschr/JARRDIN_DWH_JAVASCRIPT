function getLastExecute(currDueDate, period, step) {
	const date = new Date(currDueDate);

	switch (period) {
		case "MINUTE":
			date.setMinutes(date.getMinutes() - step);
			break;
		case "HOUR":
			date.setHours(date.getHours() - step);
			break;
		case "DAY":
			date.setDate(date.getDate() - step);
			break;
		case "MONTH":
			date.setMonth(date.getMonth() - step);
			break;
		case "YEAR":
			date.setFullYear(date.getFullYear() - step);
			break;
		default:
			throw new Error(
				"Invalid type value. Must be 'MINUTE', 'HOUR', 'DAY', 'MONTH', or 'YEAR'."
			);
	}

	return date.getTime();
}

module.exports = { getLastExecute };
