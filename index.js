const express = require("express");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");

// Configure environment variables at the very start
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the database connection
const DatabaseConnection = require("./config/DatabaseConnection");
DatabaseConnection.authenticate()
	.then(() => {
		DatabaseConnection.synchronize(true).then(async () => {
			// const { JobService } = require("./services/JobService.js");
			// await JobService.read(true);

			const routes = require("./routes");
			app.use("/", routes);

			app.listen(PORT, () => {
				console.log(`>> Server is running on http://localhost:${PORT}`);
			});
		});
	})
	.catch((err) => {
		console.error("Failed to connect to the database or synchronize it:", err);
	});

// It's useful to handle possible errors when starting the server
app.on("error", (error) => {
	console.error(`Error occurred starting the server: ${error.message}`);
});
