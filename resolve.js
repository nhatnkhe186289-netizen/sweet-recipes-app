const fs = require('fs');

function resolveServer() {
  let content = fs.readFileSync('backend/server.js', 'utf8');
  content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, '$1');
  fs.writeFileSync('backend/server.js', content);
}

function resolveUserModel() {
  let content = fs.readFileSync('backend/src/models/User.js', 'utf8');
  content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, '$1$2');
  fs.writeFileSync('backend/src/models/User.js', content);
}

function resolveRoutes() {
  let content = fs.readFileSync('backend/src/routes/index.js', 'utf8');
  content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, '$1$2');
  fs.writeFileSync('backend/src/routes/index.js', content);
}

function resolveAuthService() {
  let content = fs.readFileSync('backend/src/services/auth.service.js', 'utf8');
  content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, (match, head, theirs) => {
    if (head.includes('bcrypt.genSalt')) {
      return head + theirs;
    }
    if (head.includes('password: hashedPassword')) {
      return "    password: hashedPassword,\n    role,\n    status: 'active',";
    }
    if (head.includes('isMatch = (user.password')) {
      return "  if (user.status === 'blocked') {\n    throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');\n  }\n" + head;
    }
    return head;
  });
  fs.writeFileSync('backend/src/services/auth.service.js', content);
}

function resolveUsersJson() {
  let content = fs.readFileSync('data/users.json', 'utf8');
  content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, (match, head, theirs) => {
    let extra = '';
    if (theirs.includes('"role": "admin"')) extra = ',\n    "role": "admin",\n    "status": "active"';
    else extra = ',\n    "role": "user",\n    "status": "active"';
    // replace trailing comma or just append
    let cleanHead = head.trim();
    if (cleanHead.endsWith(',')) cleanHead = cleanHead.slice(0, -1);
    return cleanHead + extra + '\n';
  });
  fs.writeFileSync('data/users.json', content);
}

resolveServer();
resolveUserModel();
resolveRoutes();
resolveAuthService();
resolveUsersJson();
console.log('Resolved first batch');
