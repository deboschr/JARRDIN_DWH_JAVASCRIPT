const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes.js");
const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { spawn } = require("child_process");

async function initializeApp() {
	const pythonProcess = spawn("python3", ["services/scheduler.py"]);

	pythonProcess.stdout.on("data", (data) => {
		console.log(`stdout: ${data}`);
	});

	pythonProcess.stderr.on("data", (data) => {
		console.error(`stderr: ${data}`);
	});

	pythonProcess.on("error", (error) => {
		console.error(`Eksekusi gagal: ${error.message}`);
	});

	pythonProcess.on("close", (code) => {
		console.log(`Proses Python berakhir dengan kode: ${code}`);
	});

	// Melanjutkan dengan inisialisasi server Express
	app.use("/", routes);

	const port = 3001;
	app.listen(port, () => {
		console.log(`>> Server is running on http://localhost:${port}`);
	});
}

initializeApp();
