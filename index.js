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

const MyDB = require("./models/index");

MyDB.sync({ alter: true })
	.then(() => {
		app.listen(PORT, async () => {
			// const { JobService } = require("./services/JobService.js");
			// await JobService.read(true);

			// const routes = require("./routes");
			// app.use("/", routes);

			console.log(`>> Server running at http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Failed to sync database:", err);
	});
