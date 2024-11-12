const express = require("express");
const dotenv = require("dotenv");
const { DatabaseManager } = require("./config/DatabaseManager.js");
const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function initializeApp() {
	// Inisialisasi DatabaseManager dan koneksi database
	new DatabaseManager();
	await DatabaseManager.authenticate();
	// DatabaseManager.synchronize((isForce = false));

	const { JobService } = require("./services/JobService.js");
	// await JobService.read((isReload = true));

	const routes = require("./routes");
	app.use("/", routes);

	const port = 3001;
	app.listen(port, () => {
		console.log(`>> Server is running on http://localhost:${port}`);
	});
}

initializeApp();
