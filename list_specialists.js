
import fs from 'fs';
const content = fs.readFileSync('src/components/data/specialists.jsx', 'utf8');
const regex = /name:\s*'([^']+)'/g;
let match;
let i = 1;
while ((match = regex.exec(content)) !== null) {
  console.log(`${i}. ${match[1]}`);
  i++;
}
