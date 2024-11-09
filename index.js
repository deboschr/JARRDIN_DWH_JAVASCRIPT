const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes.js");
const { exec } = require("child_process");
const database = require("./config/database.json");
const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fungsi untuk membuat koneksi default
function runConnection() {
	exec("python3 services/connection.py", (error, stdout, stderr) => {
		if (error) {
			console.error(`Koneksi gagal: ${stderr}`);
			return;
		}
		console.log(stdout);
	});
}

// Jalankan koneksi saat server dimulai
runConnection();

app.use("/", routes);

const port = 3001;
app.listen(port, () => {
	console.log(`>> Server is running on http://localhost:${port}`);
});
