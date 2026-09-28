const categoryModel = require('../models/categoryModel');

const categoryController = {
  /**
   * Get all expense categories
   * GET /api/categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await categoryModel.findAll();
      res.status(200).json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;
