const { UserService } = require("../services/UserService");
const { DatabaseService } = require("../services/DatabaseService");
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
			const dataJob = await JobService.findJob();
			const dataDatabase = await DatabaseService.findDatabase();

			res.status(200).render("job", {
				page: "job",
				layout: "layouts/main",
				dataJob: dataJob,
				dataDatabase: dataDatabase,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async database(req, res) {
		try {
			const dataDatabase = await DatabaseService.findDatabase();

			res.status(200).render("database", {
				page: "database",
				layout: "layouts/main",
				dataDatabase: dataDatabase,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async user(req, res) {
		try {
			const dataUser = await UserService.findUser();

			res.status(200).render("user", {
				page: "user",
				layout: "layouts/main",
				dataUser: dataUser,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async profile(req, res) {
		try {
			const dataUser = await UserService.findUser({
				user_id: req.dataSession.user_id,
			});

			res.status(200).render("profile", {
				page: "profile",
				layout: "layouts/main",
				dataUser: dataUser,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { PageController };
