const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let image = '';

    if (req.file) {
      image = req.file.path;
    } else {
      return sendError(res, 'Category image is required', 400);
    }

    if (!name) {
      return sendError(res, 'Category name is required', 400);
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return sendError(res, 'Category already exists', 400);
    }

    const category = await Category.create({ name, image });
    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getCategories,
  createCategory,
};
