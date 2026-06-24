const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

async function readData(){
  try{ return await fs.readJson(DATA_FILE); }catch(e){ return { users:[], friends:[], friendRequests:[], messages:[] }; }
}

async function writeData(data){
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Serve static files (frontend) from project root so files are available via HTTP
app.use(express.static(path.join(__dirname)));

app.get('/users', async (req, res) => {
  const data = await readData();
  res.json(data.users);
});

app.get('/users/:id', async (req, res) => {
  const data = await readData();
  const u = data.users.find(x => x.id === req.params.id);
  if(!u) return res.status(404).json({ error: 'Not found' });
  res.json(u);
});

// Update user fields (name, email, avatar, password)
app.put('/users/:id', async (req, res) => {
  const id = req.params.id;
  const data = await readData();
  const idx = data.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const user = data.users[idx];
  const allowed = ['name','email','avatar','password','lastNameChange'];
  allowed.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
  data.users[idx] = user;
  await writeData(data);
  res.json(user);
});

app.post('/auth/register', async (req, res) => {
  const { email, name, password } = req.body;
  if(!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const data = await readData();
  if(data.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
  const user = { id: 'user_' + Date.now(), email, name, password, avatar: undefined, lastNameChange: null };
  data.users.push(user);
  await writeData(data);
  res.json(user);
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing' });
  const data = await readData();
  const user = data.users.find(u => u.email === email);
  if(!user || user.password !== password) return res.status(401).json({ error: 'Invalid' });
  res.json(user);
});

app.get('/friends/:userId', async (req, res) => {
  const data = await readData();
  const userId = req.params.userId;
  const myFriends = data.friends.filter(f => f.user1 === userId || f.user2 === userId).map(f => ({ user1: f.user1, user2: f.user2, timestamp: f.timestamp }));
  res.json(myFriends);
});

app.post('/friends/request', async (req, res) => {
  const { from, to } = req.body;
  if(!from || !to) return res.status(400).json({ error: 'Missing' });
  const data = await readData();
  if(data.friendRequests.find(r => (r.from===from && r.to===to) || (r.from===to && r.to===from))) return res.status(400).json({ error: 'Exists' });
  const reqObj = { from, to, status: 'pending', timestamp: Date.now() };
  data.friendRequests.push(reqObj);
  await writeData(data);
  res.json(reqObj);
});

// Return pending friend requests for a user
app.get('/friendRequests/:userId', async (req, res) => {
  const userId = req.params.userId;
  const data = await readData();
  const requests = data.friendRequests.filter(r => r.to === userId && r.status === 'pending');
  res.json(requests);
});

app.post('/friends/accept', async (req, res) => {
  const { from, to } = req.body;
  if(!from || !to) return res.status(400).json({ error: 'Missing' });
  const data = await readData();
  data.friendRequests = data.friendRequests.filter(r => !(r.from===from && r.to===to));
  data.friends.push({ user1: from, user2: to, timestamp: Date.now() });
  await writeData(data);
  res.json({ ok: true });
});

// Reject a friend request (remove from friendRequests)
app.post('/friendRequests/reject', async (req, res) => {
  const { from, to } = req.body;
  if(!from || !to) return res.status(400).json({ error: 'Missing' });
  const data = await readData();
  data.friendRequests = data.friendRequests.filter(r => !(r.from===from && r.to===to));
  await writeData(data);
  res.json({ ok: true });
});

app.get('/messages/:chatId', async (req, res) => {
  const data = await readData();
  const chatId = req.params.chatId;
  const msgs = data.messages.filter(m => m.chatId === chatId);
  res.json(msgs);
});

// Return all messages (for admin / stats)
app.get('/messages', async (req, res) => {
  const data = await readData();
  res.json(data.messages);
});

// Return all friends (for admin / stats)
app.get('/friends', async (req, res) => {
  const data = await readData();
  res.json(data.friends);
});

// Return all friend requests (for admin / stats)
app.get('/friendRequests', async (req, res) => {
  const data = await readData();
  res.json(data.friendRequests);
});

app.post('/messages', async (req, res) => {
  const { chatId, from, to, text, timestamp } = req.body;
  if(!chatId || !from || !text) return res.status(400).json({ error: 'Missing' });
  const data = await readData();
  const m = { chatId, from, to, text, timestamp: timestamp || Date.now() };
  data.messages.push(m);
  await writeData(data);
  res.json(m);
});

app.delete('/messages', async (req, res) => {
  const { chatId, timestamp } = req.query;
  if(!chatId || !timestamp) return res.status(400).json({ error: 'Missing' });
  const data = await readData();
  data.messages = data.messages.filter(m => !(m.chatId===chatId && String(m.timestamp)===String(timestamp)));
  await writeData(data);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API server listening on port', PORT));
