const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes.js");

const app = express();

dotenv.config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

const port = 3001;
app.listen(port, () => {
	console.log(`>> Server is running on http://localhost:${port}`);
});
