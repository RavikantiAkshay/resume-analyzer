const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('e:/ResumeAnalyzer/client/src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace fetch with credentials
  if (content.includes('fetch(')) {
    content = content.replace(/fetch\([^,]+, \{([^}]*)\}\)/g, (match, p1) => {
      if (!match.includes('credentials:')) {
        return match.replace('{', '{ credentials: "include", ');
      }
      return match;
    });
    
    // Remove Authorization: Bearer ${getToken()} from headers
    content = content.replace(/Authorization:\s*`Bearer \$\{getToken\(\)\}`\s*,?/g, '');
    
    // Cleanup empty headers {} object if left behind
    content = content.replace(/headers:\s*\{\s*\}\s*,?/g, '');
    changed = true;
  }

  // Replace localStorage logic
  if (content.includes('localStorage.setItem("token"')) {
    content = content.replace(/localStorage\.setItem\("token", [^\)]+\)/g, 'localStorage.setItem("isAuthenticated", "true")');
    changed = true;
  }

  if (content.includes('localStorage.getItem("token")')) {
    content = content.replace(/localStorage\.getItem\("token"\)/g, 'localStorage.getItem("isAuthenticated")');
    changed = true;
  }

  if (content.includes('localStorage.removeItem("token")')) {
    content = content.replace(/localStorage\.removeItem\("token"\)/g, 'localStorage.removeItem("isAuthenticated")');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
