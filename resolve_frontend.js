const fs = require('fs');

function resolveFile(filePath, type) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, (match, head, theirs) => {
    if (type === 'both') return head + theirs;
    if (type === 'head') return head;
    if (type === 'theirs') return theirs;
    if (type === 'app') {
       if (head.includes('import { NavigationContainer }')) {
          return theirs + "\n" + head.replace('import { NavigationContainer }', '// ...'); 
       }
    }
  });
  fs.writeFileSync(filePath, content);
}

// 1. SignUpScreen: Keep head (password check)
resolveFile('frontend/src/screens/auth/SignUpScreen.js', 'head');
// 2. HomeScreen: Keep both
resolveFile('frontend/src/screens/home/HomeScreen.js', 'both');
// 3. ProfileScreen: Keep both
resolveFile('frontend/src/screens/profile/ProfileScreen.js', 'both');
// 4. RecipeDetailScreen: Keep both
resolveFile('frontend/src/screens/recipe/RecipeDetailScreen.js', 'both');

console.log("Resolved frontend files except App.js");
