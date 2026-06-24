const http = require('http');
const data = JSON.stringify({ email:'test@example.com', name:'Test', password:'pass' });
const opts = { hostname: 'localhost', port: 3000, path: '/auth/register', method: 'POST', headers: { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(data) } };
const req = http.request(opts, res => { let buf=''; res.on('data', d=>buf+=d); res.on('end', ()=>{ console.log('status', res.statusCode); console.log(buf); }); });
req.on('error', e=>{ console.error(e); });
req.write(data); req.end();
