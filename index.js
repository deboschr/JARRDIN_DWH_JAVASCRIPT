const express = require("express");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");

const { DatabaseManager } = require("./config/DatabaseManager.js");
const app = express();

dotenv.config();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function initializeApp() {
	// Inisialisasi DatabaseManager dan koneksi database
	new DatabaseManager();
	await DatabaseManager.authenticate();
	DatabaseManager.synchronize((isForce = false));

	// const { JobService } = require("./services/JobService.js");
	// await JobService.read((isReload = true));

	const routes = require("./routes");
	app.use("/", routes);

	const port = 3000;
	app.listen(port, () => {
		console.log(`>> Server is running on http://localhost:${port}`);
	});
}

initializeApp();
