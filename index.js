const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes.js");
const { DatabaseManager } = require("./config/DatabaseManager.js");
const { JobService } = require("./services/JobService.js");
const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

new DatabaseManager();
DatabaseManager.authenticate();
// DatabaseManager.synchronize((isForce = false));

async function initializeApp() {
	await JobService.read((isReload = true));

	app.use("/", routes);

	const port = 3001;
	app.listen(port, () => {
		console.log(`>> Server is running on http://localhost:${port}`);
	});
}

initializeApp();
