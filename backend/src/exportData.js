const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const Recipe = require('./models/Recipe');
const Comment = require('./models/Comment');
const Favorite = require('./models/Favorite');
const Notification = require('./models/Notification');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const exportData = async () => {
  try {
    console.log('Connecting to MongoDB for export...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully!');

    // Fetch all data
    const users = await User.find({}).lean();
    const categories = await Category.find({}).lean();
    const recipes = await Recipe.find({}).lean();
    const comments = await Comment.find({}).lean();
    const favorites = await Favorite.find({}).lean();
    const notifications = await Notification.find({}).lean();

    const data = {
      users,
      categories,
      recipes,
      comments,
      favorites,
      notifications,
    };

    // Ensure data directory exists
    const dataDir = path.resolve(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Write to seedData.json
    const filePath = path.join(dataDir, 'seedData.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Data exported successfully to ${filePath}`);
    console.log(`Exported: ${users.length} Users, ${categories.length} Categories, ${recipes.length} Recipes, ${comments.length} Comments, ${favorites.length} Favorites, ${notifications.length} Notifications.`);

    process.exit(0);
  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
};

exportData();
