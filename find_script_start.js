const fs=require('fs'); const path=require('path'); const s=fs.readFileSync(path.join(__dirname,'Index.html'),'utf8');
const lines=s.split(/\n/);
for(let i=0;i<lines.length;i++){
  if(lines[i].toLowerCase().includes('<script')){ console.log('script starts at line', i+1); process.exit(0);} }
console.log('no script tag found');
