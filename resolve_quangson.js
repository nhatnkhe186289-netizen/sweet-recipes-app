const fs = require('fs');

function resolve(filePath, type) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Simple replace for the outer merge conflict
  // We use [\s\S]*? to match across newlines
  content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, (match, head, theirs) => {
    // If it contains nested markers from git diff output, we clean them if needed
    // Actually git inserts literal markers. We just concatenate head + theirs
    let cleanHead = head.replace(/<<<<<<< HEAD\n/g, '').replace(/=======\n/g, '').replace(/>>>>>>> [0-9a-f]+\n/g, '');
    let cleanTheirs = theirs.replace(/<<<<<<< HEAD\n/g, '').replace(/=======\n/g, '').replace(/>>>>>>> [0-9a-f]+\n/g, '');
    
    if (type === 'both') return cleanHead + cleanTheirs;
    if (type === 'head') return cleanHead;
    if (type === 'theirs') return cleanTheirs;
  });
  fs.writeFileSync(filePath, content);
}

resolve('backend/src/models/User.js', 'both');
resolve('backend/src/routes/index.js', 'both');
resolve('frontend/src/navigation/AppNavigator.js', 'both');
resolve('frontend/src/screens/profile/ProfileScreen.js', 'both');
resolve('frontend/src/screens/recipe/RecipeDetailScreen.js', 'both');
resolve('frontend/src/services/api.js', 'head');

console.log("Resolved quangson");
