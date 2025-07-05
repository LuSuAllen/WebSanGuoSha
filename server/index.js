import { createRoom, joinRoom, leaveRoom, getRoomList, setPlayerReady, kickPlayer, dismissRoom } from './roomManager.js';

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';



const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 设置玩家准备状态
app.post('/api/rooms/:id/ready', express.json(), (req, res) => {
  const { id } = req.params;
  const { playerId, ready, start } = req.body;
  if (!playerId || (typeof ready !== 'boolean' && typeof start !== 'boolean')) return res.status(400).json({ error: '参数缺失' });
  const room = setPlayerReady(id, playerId, ready, start);
  if (!room) return res.status(404).json({ error: '房间不存在' });
  res.json(room);
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // 简单广播消息给所有客户端
    wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(message);
      }
    });
  });
  ws.send(JSON.stringify({ type: 'system', msg: '欢迎加入三国杀房间！' }));
});


// 获取房间列表
app.get('/api/rooms', (req, res) => {
  res.json(getRoomList());
});

// 创建房间
app.post('/api/rooms', express.json(), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '房间名不能为空' });
  const room = createRoom(name);
  res.json(room);
});


// 加入房间
app.post('/api/rooms/:id/join', express.json(), (req, res) => {
  const { id } = req.params;
  const { playerId, name } = req.body;
  if (!playerId || !name) return res.status(400).json({ error: '参数缺失' });
  const room = joinRoom(id, { playerId, name });
  if (!room) return res.status(404).json({ error: '房间不存在' });
  res.json(room);
});

// 离开房间
app.post('/api/rooms/:id/leave', express.json(), (req, res) => {
  const { id } = req.params;
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: '参数缺失' });
  const room = leaveRoom(id, playerId);
  if (!room) return res.status(404).json({ error: '房间不存在' });
  res.json(room);
});

// 踢人（仅房主可用）
app.post('/api/rooms/:id/kick', express.json(), (req, res) => {
  const { id } = req.params;
  const { playerId, targetPlayerId } = req.body;
  if (!playerId || !targetPlayerId) return res.status(400).json({ error: '参数缺失' });
  // 校验房主
  const room = getRoomList().find(r => r.id === id);
  if (!room || room.players[0].playerId !== playerId) return res.status(403).json({ error: '无权限' });
  const updated = kickPlayer(id, targetPlayerId);
  if (!updated) return res.status(404).json({ error: '房间不存在' });
  res.json(updated);
});

// 解散房间（仅房主可用）
app.post('/api/rooms/:id/dismiss', express.json(), (req, res) => {
  const { id } = req.params;
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: '参数缺失' });
  const room = getRoomList().find(r => r.id === id);
  if (!room || room.players[0].playerId !== playerId) return res.status(403).json({ error: '无权限' });
  const ok = dismissRoom(id);
  if (!ok) return res.status(404).json({ error: '房间不存在' });
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.send('三国杀 WebSocket 服务器运行中');
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`服务器已启动，端口：${PORT}`);
});
