const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes.js");
const { exec } = require("child_process");
const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function initializeApp() {
	exec(`python3 services/scheduler.py`, (error, stdout, stderr) => {
		if (error) {
			console.error(`Eksekusi gagal: ${error}`);
			return;
		}
		console.log(stdout);
	});

	app.use("/", routes);

	const port = 3001;
	app.listen(port, () => {
		console.log(`>> Server is running on http://localhost:${port}`);
	});
}

initializeApp();
