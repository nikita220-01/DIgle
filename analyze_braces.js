const fs=require('fs'); const path=require('path');
const file=path.join(__dirname,'Index.html'); const s=fs.readFileSync(file,'utf8');
const m=s.match(/<script[\s\S]*?<\/script>/i); const content = m? m[0].replace(/<script[^>]*>/i,'').replace(/<\/script>/i,''): s;
let stack=[]; let lines=content.split(/\n/);
for(let i=0;i<lines.length;i++){
  let line=lines[i];
  for(let j=0;j<line.length;j++){
    let ch=line[j];
    if(ch==='{') stack.push({ch:i+1,col:j+1});
    else if(ch==='}'){
      if(stack.length===0){ console.log('Extra } at',i+1,j+1); process.exit(0); }
      stack.pop();
    }
  }
}
if(stack.length>0){ console.log('Unclosed { count=',stack.length); console.log('First unclosed at line', stack[0].ch, 'col', stack[0].col); console.log('Last unclosed at line', stack[stack.length-1].ch, 'col', stack[stack.length-1].col); }
else console.log('All braces closed');
