const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'Index.html');
const s = fs.readFileSync(file,'utf8');
const scriptMatch = s.match(/<script[\s\S]*?<\/script>/i);
const content = scriptMatch ? scriptMatch[0] : s;
function countChars(str, ch){return (str.split(ch).length-1);} 
const counts = {
  openBrace: countChars(content,'{'),
  closeBrace: countChars(content,'}'),
  openParen: countChars(content,'('),
  closeParen: countChars(content,')'),
  openBracket: countChars(content,'['),
  closeBracket: countChars(content,']'),
  quotesSingle: countChars(content,"'"),
  quotesDouble: countChars(content,'"')
};
console.log('Counts in <script> (or whole file if no script):', counts);
console.log('Last 300 chars of script/file:\n', content.slice(-300));
process.exit(0);
