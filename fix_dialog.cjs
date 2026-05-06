const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/pages/admin/UsersPage/UsersPage.module.css',
  'src/pages/admin/AiApiKeysPage/AiApiKeysPage.module.css',
  'src/pages/admin/AuditLogsPage/AuditLogsPage.module.css'
];

cssFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Fix overlay
  content = content.replace(/\.overlay\s*\{[\s\S]*?z-index:\s*100;[\s\S]*?\}/g, match => {
    return match
      .replace(/background:\s*rgba\(15,\s*23,\s*42,\s*0\.45\);/g, 'background: rgba(15, 23, 42, 0.25);')
      .replace(/backdrop-filter:\s*blur\(2px\);/g, 'backdrop-filter: blur(8px);');
  });

  // Fix dialog
  content = content.replace(/\.dialog\s*\{[\s\S]*?max-height:\s*90vh;[\s\S]*?\}/g, match => {
    return match
      .replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.15\);/g, 'background: rgba(255, 255, 255, 0.85);')
      .replace(/backdrop-filter:\s*blur\(24px\);/g, 'backdrop-filter: blur(40px);')
      .replace(/-webkit-backdrop-filter:\s*blur\(24px\);/g, '-webkit-backdrop-filter: blur(40px);')
      .replace(/border-radius:\s*14px;/g, 'border-radius: 16px;\n  border: 1px solid rgba(255, 255, 255, 0.5);');
  });

  // Fix dialogHeader border
  content = content.replace(/\.dialogHeader\s*\{[\s\S]*?border-bottom:\s*1px\s*solid[\s\S]*?\}/g, match => {
    return match.replace(/border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.3\);/g, 'border-bottom: 1px solid rgba(0, 0, 0, 0.08);');
  });

  // Fix dialogFooter border
  content = content.replace(/\.dialogFooter\s*\{[\s\S]*?border-top:\s*1px\s*solid[\s\S]*?\}/g, match => {
    return match.replace(/border-top:\s*1px\s*solid\s*#f1f5f9;/g, 'border-top: 1px solid rgba(0, 0, 0, 0.08);');
  });

  // Fix inputs
  content = content.replace(/\.input\s*\{[\s\S]*?outline:\s*none;[\s\S]*?\}/g, match => {
    return match
      .replace(/border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.5\);/g, 'border: 1px solid rgba(0, 0, 0, 0.15);')
      .replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.15\);/g, 'background: rgba(255, 255, 255, 0.6);')
      .replace(/backdrop-filter:\s*blur\(24px\);/g, 'backdrop-filter: blur(12px);')
      .replace(/-webkit-backdrop-filter:\s*blur\(24px\);/g, '-webkit-backdrop-filter: blur(12px);');
  });

  fs.writeFileSync(fullPath, content, 'utf8');
});

console.log('Fixed dialog styling!');
