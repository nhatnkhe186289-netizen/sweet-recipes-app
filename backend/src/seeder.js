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
      await User.insertMany(data.users);
      console.log(`Imported ${data.users.length} Users.`);
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
      await Comment.insertMany(data.comments);
      console.log(`Imported ${data.comments.length} Comments.`);
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
