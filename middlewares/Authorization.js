const jwt = require("jsonwebtoken");

class Authorization {
	static async encryption(payload) {
		try {
			const secretKey = process.env.SECRET_KEY;

			const options = {
				expiresIn: "12h",
			};

			const token = jwt.sign(payload, secretKey, options);

			return token;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	static async decryption(req, res, next) {
		try {
			const token = req.headers["token"];
			const dataSession = req.session.dataSession;

			if (token) {
				req.dataSession = jwt.verify(token, process.env.SECRET_KEY);
			} else if (dataSession) {
				req.dataSession = dataSession;
			} else {
				return res.redirect("/page/v1/signin");
			}

			next();
		} catch (error) {
			console.error(error);

			if (error.name === "TokenExpiredError") {
				return res.status(403).json({ message: "Token has expired" });
			}

			return res.status(403).json({ message: "Forbidden" });
		}
	}
}

module.exports = { Authorization };
