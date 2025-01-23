const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
	session({
		secret: process.env.SECRET_KEY,
		resave: false,
		saveUninitialized: true,
		// cookie: { secure: true },
	})
);
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DatabaseConnection = require("./config/DatabaseConnection");
DatabaseConnection.authenticate()
	.then(async () => {
		const routes = require("./routes");
		app.use("/", routes);

		// await DatabaseConnection.synchronize(true);

		app.listen(PORT, () => {
			console.log(`>> Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error(err);
	});
