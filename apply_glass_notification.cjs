const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/NotificationConfigPage/NotificationConfigPage.module.css');
let content = fs.readFileSync(filePath, 'utf8');

// .tableCard
content = content.replace(
  /\.tableCard\s*\{[\s\S]*?border:\s*1px\s*solid\s*#e5e7eb;[\s\S]*?\}/,
  `.tableCard {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
  border-radius: 12px;
  overflow: hidden;
}`
);

// .section
content = content.replace(
  /\.section\s*\{\s*border-bottom:\s*1px\s*solid\s*#e5e7eb;\s*\}/,
  `.section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}`
);

// .sectionHeader
content = content.replace(
  /\.sectionHeader\s*\{[\s\S]*?border-bottom:\s*1px\s*solid\s*#e5e7eb;[\s\S]*?\}/,
  `.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  gap: 12px;
}`
);

// .sectionBadge
content = content.replace(
  /\.sectionBadge\s*\{[\s\S]*?border:\s*1px\s*solid\s*#e5e7eb;[\s\S]*?\}/,
  `.sectionBadge {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  padding: 2px 8px;
  font-family: monospace;
}`
);

// .row
content = content.replace(
  /\.row\s*\{[\s\S]*?border-bottom:\s*1px\s*solid\s*#f3f4f6;[\s\S]*?\}/,
  `.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  transition: background 0.12s;
  background: transparent;
}`
);

// .row:hover
content = content.replace(
  /\.row:hover\s*\{\s*background:\s*#f9fafb;\s*\}/,
  `.row:hover {
  background: rgba(255, 255, 255, 0.4);
}`
);

// .disclaimer
content = content.replace(
  /\.disclaimer\s*\{[\s\S]*?border:\s*1px\s*solid\s*#ddd6fe;[\s\S]*?\}/,
  `.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(139, 92, 246, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 10px;
  font-size: 12.5px;
  color: #6b7280;
  line-height: 1.5;
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Processed NotificationConfigPage.module.css');
