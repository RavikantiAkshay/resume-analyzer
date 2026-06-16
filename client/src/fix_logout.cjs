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

  const handleLogoutRegex = /const handleLogout = \(\) => \{[\s\S]*?navigate\("\/login"\);\s*\};/g;

  content = content.replace(handleLogoutRegex, `const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/auth/logout", { method: "POST" });
    } catch (err) {}
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };`);

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed handleLogout in ' + file);
  }
});
