const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes.js");
const { Scheduler } = require("./utils/Scheduler.js");
const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function initializeApp() {
	// await Scheduler.loadJobsFromDB();

	app.use("/", routes);

	const port = 3001;
	app.listen(port, () => {
		console.log(`>> Server is running on http://localhost:${port}`);
	});
}

initializeApp();
