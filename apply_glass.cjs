const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages', 'admin');

function traverseAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndReplace(fullPath);
    } else if (fullPath.endsWith('.module.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace background: #fff or #ffffff with glassmorphism
      const glassBg = 'background: rgba(255, 255, 255, 0.35);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);';
      
      content = content.replace(/background:\s*#(fff|ffffff)\s*;/g, glassBg);
      
      // Also make table headers and borders slightly transparent
      content = content.replace(/background:\s*#f8fafc\s*;/g, 'background: rgba(255, 255, 255, 0.15);');
      content = content.replace(/border-color:\s*#e2e8f0\s*;/g, 'border-color: rgba(255, 255, 255, 0.5);');
      content = content.replace(/border:\s*1px\s*solid\s*#e2e8f0\s*;/g, 'border: 1px solid rgba(255, 255, 255, 0.5);');
      content = content.replace(/border-bottom:\s*1px\s*solid\s*#e2e8f0\s*;/g, 'border-bottom: 1px solid rgba(255, 255, 255, 0.4);');
      content = content.replace(/border-bottom:\s*1px\s*solid\s*#f1f5f9\s*;/g, 'border-bottom: 1px solid rgba(255, 255, 255, 0.3);');

      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${fullPath}`);
    }
  }
}

traverseAndReplace(directoryPath);
