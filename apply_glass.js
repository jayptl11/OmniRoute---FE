const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/admin/NotificationConfigPage/NotificationConfigPage.module.css',
  'src/pages/admin/RoutingRulesPage/RoutingRulesPage.module.css',
  'src/pages/admin/SystemStatsPage/SystemStatsPage.module.css',
  'src/pages/admin/UsersPage/UsersPage.module.css'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Table wraps / Cards
  content = content.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.35\);[\s\S]*?backdrop-filter:\s*blur\(16px\);/g, 
    'background: rgba(255, 255, 255, 0.15);\n  backdrop-filter: blur(24px);');
  content = content.replace(/-webkit-backdrop-filter:\s*blur\(16px\);/g, '-webkit-backdrop-filter: blur(24px);');
  
  // 2. Solid #fff backgrounds (like in AuditLogsPage/NotificationConfigPage) to glass
  content = content.replace(/background:\s*#fff;\s*\n\s*border/g, 'background: rgba(255, 255, 255, 0.15);\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);\n  border');
  
  // 3. Primary buttons (#6366f1)
  content = content.replace(/background:\s*#6366f1;/g, 'background: rgba(99, 102, 241, 0.15);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(99, 102, 241, 0.3);');
  content = content.replace(/\.btnPrimary\s*\{\s*([\s\S]*?)color:\s*#fff;/g, '.btnPrimary {\n$1color: #4338ca;');
  content = content.replace(/background:\s*#4f46e5;/g, 'background: rgba(99, 102, 241, 0.25);\n  border-color: rgba(99, 102, 241, 0.5);');

  // 4. Danger buttons (#ef4444)
  content = content.replace(/background:\s*#ef4444;/g, 'background: rgba(239, 68, 68, 0.15);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(239, 68, 68, 0.3);');
  content = content.replace(/\.btnDanger\s*\{\s*([\s\S]*?)color:\s*#fff;/g, '.btnDanger {\n$1color: #dc2626;');
  content = content.replace(/background:\s*#dc2626;/g, 'background: rgba(239, 68, 68, 0.25);\n  border-color: rgba(239, 68, 68, 0.5);');

  // 5. Table hover rows
  content = content.replace(/background:\s*#fafbff;/g, 'background: rgba(255, 255, 255, 0.4);');
  content = content.replace(/background:\s*#f9fafb;/g, 'background: rgba(255, 255, 255, 0.2);');

  // 6. Action buttons hover
  content = content.replace(/background:\s*#f1f5f9;/g, 'background: rgba(255, 255, 255, 0.6);');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Processed', file);
});
