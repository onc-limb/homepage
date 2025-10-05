const fs = require('fs');
const path = require('path');
const profilePath = path.join(__dirname, '..', 'app', 'profile', 'profile.md');
const outputPath = path.join(__dirname, '..', 'lib', 'profileData.ts');
// profile.md の内容を読み込む
const profileContent = fs.readFileSync(profilePath, 'utf-8');
// TypeScript ファイルを生成
const output = `// このファイルはビルド時に自動生成されます
// profile.md の内容が静的に埋め込まれます
export const profileMarkdown = ${JSON.stringify(profileContent)};
`;
// ファイルに書き込む
fs.writeFileSync(outputPath, output, 'utf-8');
console.log('✅ profileData.ts が生成されました');
