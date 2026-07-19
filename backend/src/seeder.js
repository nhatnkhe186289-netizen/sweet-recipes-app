const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const Recipe = require('./models/Recipe');
const Comment = require('./models/Comment');
const Favorite = require('./models/Favorite');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    const dataDir = path.resolve(__dirname, 'data');
    const filePath = path.join(dataDir, 'seedData.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('No seedData.json found. Skipping seeding.');
      return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Check if database is already populated
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping auto-seed.');
      return;
    }

    console.log('Database is empty. Starting auto-seed...');

    // Clear existing data (just in case)
    await User.deleteMany();
    await Category.deleteMany();
    await Recipe.deleteMany();
    await Comment.deleteMany();
    await Favorite.deleteMany();
    await Notification.deleteMany();

    // Insert new data
    if (data.users && data.users.length > 0) {
      const bcrypt = require('bcryptjs');
      const formattedUsers = data.users.map(u => {
        const password = (u.password && !u.password.startsWith('$2')) 
          ? bcrypt.hashSync(u.password, 10) 
          : u.password;
        return { ...u, password };
      });
      await User.insertMany(formattedUsers);
      console.log(`Imported ${formattedUsers.length} Users.`);
    }
    
    if (data.categories && data.categories.length > 0) {
      await Category.insertMany(data.categories);
      console.log(`Imported ${data.categories.length} Categories.`);
    }
    
    if (data.recipes && data.recipes.length > 0) {
      await Recipe.insertMany(data.recipes);
      console.log(`Imported ${data.recipes.length} Recipes.`);
    }
    
    if (data.comments && data.comments.length > 0) {
      const allUsers = await User.find({});
      const allRecipes = await Recipe.find({});
      const userMap = new Map(allUsers.map(u => [u.email, u._id]));
      const recipeMap = new Map(allRecipes.map(r => [r.title, r._id]));

      const formattedComments = data.comments.map(c => {
        const userId = c.userId || userMap.get(c.userEmail);
        const recipeId = c.recipeId || recipeMap.get(c.recipeTitle);
        if (!userId || !recipeId) return null;
        return {
          _id: c._id,
          userId,
          recipeId,
          content: c.content,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt || c.createdAt
        };
      }).filter(Boolean);

      await Comment.insertMany(formattedComments);
      console.log(`Imported ${formattedComments.length} Comments.`);
    }

    if (data.favorites && data.favorites.length > 0) {
      await Favorite.insertMany(data.favorites);
      console.log(`Imported ${data.favorites.length} Favorites.`);
    }

    if (data.notifications && data.notifications.length > 0) {
      await Notification.insertMany(data.notifications);
      console.log(`Imported ${data.notifications.length} Notifications.`);
    }

    console.log('Auto-seed completed successfully!');
  } catch (error) {
    console.error('Error during auto-seeding:', error);
  }
};

module.exports = seedData;
