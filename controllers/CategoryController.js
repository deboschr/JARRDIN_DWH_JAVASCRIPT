const {
	CategoryRepository,
} = require("../database/repositories/CategoryRepository");
const { Validator } = require("../utils/validator");

class CategoryController {
	static async getAll(req, res) {
		try {
			const { error } = Validator.getAllCategory(req.query);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			let readCategory = await CategoryRepository.readAll(req.query, {
				EnterpriseID: req.dataLogin.EnterpriseID,
				OutletID: req.dataSession.OutletID,
			});

			res.status(200).json(readCategory);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async getOne(req, res) {
		try {
			let readCategory = await CategoryRepository.readOne(req.params.id, {
				EnterpriseID: req.dataLogin.EnterpriseID,
				OutletID: req.dataSession.OutletID,
			});

			res.status(200).json(readCategory);
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async post(req, res) {
		try {
			let { error } = Validator.createCategory(req.body, req.dataSession);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const createCategory = await CategoryRepository.create(req.body, {
				EnterpriseID: req.dataLogin.EnterpriseID,
				OutletID: req.dataSession.OutletID,
				SparkUserID: req.dataLogin.SparkUserID,
			});

			res.status(200).json({
				success: true,
				data: createCategory,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async patch(req, res) {
		try {
			let { error } = Validator.updateCategory(req.body);

			if (error) {
				const newError = new Error(error.details[0].message);
				newError.status = 400;
				throw newError;
			}

			const updateCategory = await CategoryRepository.update(req.body, {
				EnterpriseID: req.dataLogin.EnterpriseID,
				OutletID: req.dataSession.OutletID,
				SparkUserID: req.dataLogin.SparkUserID,
			});

			res.status(200).json({
				success: true,
				data: updateCategory,
			});
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}

	static async delete(req, res) {
		try {
			const deleteCategory = await CategoryRepository.delete(
				req.params.id,
				req.dataLogin.EnterpriseID
			);

			res.status(200).json({ success: true });
		} catch (error) {
			console.error(error);
			res.status(error.status || 500).json({ error: error.message });
		}
	}
}

module.exports = { CategoryController };
