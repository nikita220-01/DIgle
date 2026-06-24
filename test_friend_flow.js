const http = require('http');
function req(opts, body){
  return new Promise((res, rej)=>{
    const r = http.request(opts, resp=>{ let buf=''; resp.on('data', d=>buf+=d); resp.on('end', ()=>{ try{ res({status:resp.statusCode, body: JSON.parse(buf || 'null')}); }catch(e){ res({status:resp.statusCode, body:buf}); } }); });
    r.on('error', e=>rej(e));
    if(body) r.write(JSON.stringify(body));
    r.end();
  });
}

(async ()=>{
  const host = process.env.API_HOST || 'localhost';
  const port = process.env.API_PORT || 3000;
  const base = { hostname: host, port: port };
  console.log('Using API at', host+':'+port);

  // create two users
  const u1 = { email: 'alice@example.com', name: 'Alice', password: 'alicepass' };
  const u2 = { email: 'bob@example.com', name: 'Bob', password: 'bobpass' };

  try{
    console.log('\nRegister user1');
    let r = await req(Object.assign({}, base, { path: '/auth/register', method: 'POST', headers:{'Content-Type':'application/json'} }), u1);
    console.log(r.status, r.body);
    const user1 = r.body;

    console.log('\nRegister user2');
    r = await req(Object.assign({}, base, { path: '/auth/register', method: 'POST', headers:{'Content-Type':'application/json'} }), u2);
    console.log(r.status, r.body);
    const user2 = r.body;

    console.log('\nSend friend request from user1 to user2');
    r = await req(Object.assign({}, base, { path: '/friends/request', method: 'POST', headers:{'Content-Type':'application/json'} }), { from: user1.id, to: user2.id });
    console.log(r.status, r.body);

    console.log('\nCheck friendRequests for user2');
    r = await req(Object.assign({}, base, { path: '/friendRequests/' + encodeURIComponent(user2.id), method: 'GET' }));
    console.log(r.status, r.body);

    console.log('\nAccept friend request (user2 accepts)');
    r = await req(Object.assign({}, base, { path: '/friends/accept', method: 'POST', headers:{'Content-Type':'application/json'} }), { from: user1.id, to: user2.id });
    console.log(r.status, r.body);

    console.log('\nCheck friends for user1');
    r = await req(Object.assign({}, base, { path: '/friends/' + encodeURIComponent(user1.id), method: 'GET' }));
    console.log(r.status, r.body);

    console.log('\nDone');
  }catch(e){ console.error('Error', e); }
})();