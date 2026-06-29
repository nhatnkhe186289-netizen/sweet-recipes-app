import api from './api';

const getRecipeComments = async (recipeId) => {
  const response = await api.get(`/comments/${recipeId}`);
  return response.data.data;
};

const addComment = async (recipeId, content) => {
  const response = await api.post('/comments', { recipeId, content });
  return response.data.data;
};

const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

export default {
  getRecipeComments,
  addComment,
  deleteComment,
};
