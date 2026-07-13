const fs = require('fs');
const path = require('path');

const files = [
  'src/screens/search/SearchScreen.js',
  'src/screens/recipe/RecipeDetailScreen.js',
  'src/screens/profile/ProfileScreen.js',
  'src/screens/onboarding/OnboardingScreen.js',
  'src/screens/home/HomeScreen.js',
  'src/screens/favorites/FavoritesScreen.js',
  'src/screens/comments/CommentsScreen.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if SafeAreaView is imported from react-native
    if (content.match(/import\s+{[^}]*SafeAreaView[^}]*}\s+from\s+['"]react-native['"]/s)) {
      // Remove SafeAreaView from the destructured import from react-native
      content = content.replace(/SafeAreaView,\s*/g, '');
      content = content.replace(/,\s*SafeAreaView/g, '');
      content = content.replace(/{\s*SafeAreaView\s*}/g, '{}');
      
      // Clean up empty imports
      content = content.replace(/import\s*{}\s*from\s*['"]react-native['"];?\n?/g, '');
      
      // Add SafeAreaView import from react-native-safe-area-context
      const importContext = `import { SafeAreaView } from 'react-native-safe-area-context';\n`;
      content = importContext + content;
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', file);
    }
  }
});
