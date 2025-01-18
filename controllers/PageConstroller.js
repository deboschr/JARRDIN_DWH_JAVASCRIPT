const { JobService } = require("../services/JobService");

class PageController {
	static async signin(req, res) {
		try {
			res.status(200).render("signin", { layout: false });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async signup(req, res) {
		try {
			res.status(200).render("signup", { layout: false });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async dashboard(req, res) {
		try {
			let readJob = await JobService.read();

			res.status(200).render("dashboard", {
				page: "dashboard",
				layout: "layouts/main",
				data: JSON.stringify(readJob),
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async job(req, res) {
		try {
			let readJob = await JobService.read();

			res.status(200).render("job", {
				page: "job",
				layout: "layouts/main",
				data: JSON.stringify(readJob),
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async dbconfig(req, res) {
		try {
			let readJob = await JobService.read();

			res.status(200).render("dbconfig", {
				page: "dbconfig",
				layout: "layouts/main",
				data: JSON.stringify(readJob),
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async profile(req, res) {
		try {
			let readJob = await JobService.read();

			res.status(200).render("profile", {
				page: "profile",
				layout: "layouts/main",
				data: JSON.stringify(readJob),
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { PageController };
