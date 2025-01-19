const crypto = require("crypto");

class Authentication {
	static async encryption(plainPassword) {
		const salt = crypto.randomBytes(16); // 16 bytes salt
		const keylen = 64; // Output length in bytes
		const cost = 16384; // CPU/memory cost parameter (N)
		const blockSize = 8; // Block size parameter (r)
		const parallelization = 1; // Parallelization parameter (p)

		return new Promise((resolve, reject) => {
			crypto.scrypt(
				plainPassword,
				salt,
				keylen,
				{ N: cost, r: blockSize, p: parallelization },
				(err, derivedKey) => {
					if (err) {
						console.error(err);
						reject(err);
					} else {
						const cipherPassword = `${salt.toString(
							"hex"
						)}:${derivedKey.toString("hex")}`;
						resolve(cipherPassword);
					}
				}
			);
		});
	}

	static async decryption(cipherPassword, plainPassword) {
		const [saltHex, keyHex] = cipherPassword.split(":");
		const salt = Buffer.from(saltHex, "hex");
		const key = Buffer.from(keyHex, "hex");
		const keylen = 64;
		const cost = 16384;
		const blockSize = 8;
		const parallelization = 1;

		return new Promise((resolve, reject) => {
			crypto.scrypt(
				plainPassword,
				salt,
				keylen,
				{ N: cost, r: blockSize, p: parallelization },
				(err, derivedKey) => {
					if (err) {
						console.error(err);
						reject(err);
					} else {
						const isMatch = crypto.timingSafeEqual(derivedKey, key);
						resolve(isMatch);
					}
				}
			);
		});
	}
}

module.exports = { Authentication };
