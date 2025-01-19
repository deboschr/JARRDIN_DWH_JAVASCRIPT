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

	static async dashboard(req, res) {
		try {
			res.status(200).render("dashboard", {
				page: "dashboard",
				layout: "layouts/main",
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async job(req, res) {
		try {
			res.status(200).render("job", {
				page: "job",
				layout: "layouts/main",
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async dbconfig(req, res) {
		try {
			res.status(200).render("dbconfig", {
				page: "dbconfig",
				layout: "layouts/main",
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async user(req, res) {
		try {
			res.status(200).render("user", {
				page: "user",
				layout: "layouts/main",
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async profile(req, res) {
		try {
			res.status(200).render("profile", {
				page: "profile",
				layout: "layouts/main",
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { PageController };
