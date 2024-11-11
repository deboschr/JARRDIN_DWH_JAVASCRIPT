const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes.js");
const { Scheduler } = require("./utils/Scheduler.js");
const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { spawn } = require("child_process");

async function initializeApp() {
	await Scheduler.loadJobsFromDB();

	// Melanjutkan dengan inisialisasi server Express
	app.use("/", routes);

	const port = 3001;
	app.listen(port, () => {
		console.log(`>> Server is running on http://localhost:${port}`);
	});
}

initializeApp();
