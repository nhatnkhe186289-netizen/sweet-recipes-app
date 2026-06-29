const Comment = require('../models/Comment');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getRecipeComments = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const comments = await Comment.find({ recipeId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, comments, 'Comments retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const addComment = async (req, res) => {
  try {
    const { recipeId, content } = req.body;
    if (!recipeId || !content) {
      return sendError(res, 'Recipe ID and content are required', 400);
    }

    const comment = await Comment.create({
      userId: req.user._id,
      recipeId,
      content,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username avatar');

    return sendSuccess(res, populatedComment, 'Comment added successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this comment', 403);
    }

    await Comment.findByIdAndDelete(id);
    return sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getRecipeComments,
  addComment,
  deleteComment,
};
