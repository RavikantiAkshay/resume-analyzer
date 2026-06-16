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

  // Add credentials: "include" if not present inside fetch options
  if (content.includes('fetch(')) {
    const newContent = content.replace(/fetch\([^,]+, \s*\{/g, (match) => {
      if (!content.includes('credentials: "include"')) {
        return match + '\n        credentials: "include",';
      }
      return match;
    });
    
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed fetch in ' + file);
  }
});
