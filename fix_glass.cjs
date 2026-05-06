const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/pages/admin/UsersPage/UsersPage.module.css',
  'src/pages/admin/SystemStatsPage/SystemStatsPage.module.css',
  'src/pages/admin/RoutingRulesPage/RoutingRulesPage.module.css',
  'src/pages/admin/AuditLogsPage/AuditLogsPage.module.css',
  'src/pages/admin/AiApiKeysPage/AiApiKeysPage.module.css'
];

cssFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace background 0.35 -> 0.15 for cards/tables/inputs
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.35\)/g, 'rgba(255, 255, 255, 0.15)');
  
  // Replace background #fff -> rgba(255, 255, 255, 0.15) if it's not a text color
  // Wait, let's just make sure we do it carefully. In most of these, we want to just replace all #fff backgrounds:
  content = content.replace(/background:\s*#fff;/g, 'background: rgba(255, 255, 255, 0.15);');
  content = content.replace(/background:\s*#f8fafc;/g, 'background: rgba(255, 255, 255, 0.1);');
  content = content.replace(/background:\s*#fafbff;/g, 'background: rgba(255, 255, 255, 0.3);');
  content = content.replace(/background:\s*#f1f5f9;/g, 'background: rgba(255, 255, 255, 0.4);');
  
  // Blur values
  content = content.replace(/blur\(16px\)/g, 'blur(24px)');

  // Button backgrounds
  content = content.replace(/background:\s*#6366f1;/g, 'background: rgba(99, 102, 241, 0.15);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(99, 102, 241, 0.3);');
  content = content.replace(/background:\s*#4f46e5;/g, 'background: rgba(99, 102, 241, 0.25);');
  content = content.replace(/\.btnPrimary\s*\{\s*([\s\S]*?)color:\s*#fff;/g, '.btnPrimary {\n$1color: #4338ca;');

  content = content.replace(/background:\s*#ef4444;/g, 'background: rgba(239, 68, 68, 0.15);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(239, 68, 68, 0.3);');
  content = content.replace(/background:\s*#dc2626;/g, 'background: rgba(239, 68, 68, 0.25);');
  content = content.replace(/\.btnDanger\s*\{\s*([\s\S]*?)color:\s*#fff;/g, '.btnDanger {\n$1color: #dc2626;');

  fs.writeFileSync(fullPath, content, 'utf8');
});

// Fix StoresPage inline styling
const storesPagePath = path.join(__dirname, 'src/pages/admin/StoresPage/StoresPage.tsx');
if (fs.existsSync(storesPagePath)) {
  let tsxContent = fs.readFileSync(storesPagePath, 'utf8');
  tsxContent = tsxContent.replace(/background: 'var\(--color-bg\)'/g, "background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(24px)'");
  fs.writeFileSync(storesPagePath, tsxContent, 'utf8');
}

console.log('Fixed all glassmorphism issues!');
