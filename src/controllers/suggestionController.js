const suggestionService = require('../services/suggestionService');

const suggestionController = {
  /**
   * Get personalized, data-driven spending suggestions & habits score
   * GET /api/suggestions
   */
  async getSuggestions(req, res, next) {
    try {
      const { month, year } = req.query;
      const suggestionsData = await suggestionService.generateSuggestions(
        req.user.id,
        month,
        year
      );

      res.status(200).json({
        success: true,
        data: suggestionsData
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = suggestionController;
