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

			if (!token) {
				return res.redirect("/user/signin");
			}

			req.dataSession = jwt.verify(token, process.env.SECRET_KEY);

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
