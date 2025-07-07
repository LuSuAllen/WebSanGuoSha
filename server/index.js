
import { createRoom, joinRoom, leaveRoom, getRoomList, setPlayerReady, kickPlayer, dismissRoom } from './roomManager.js';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 出牌接口
import { playCard, resolveActionStack, nextTurn, drawCards, discardCards } from './roomManager.js';

// 出牌接口（支持杀-闪-扣血主流程）
app.post('/api/rooms/:id/play', express.json(), (req, res) => {
  const { id } = req.params;
  const { playerId, card, targetId } = req.body;
  const room = getRoomList().find(r => r.id === id);
  if (!room || !room.game) return res.status(404).json({ error: '房间或游戏不存在' });
  const game = room.game;
  // 校验是否当前回合
  const currentIdx = game.turn % game.playerStates.length;
  if (game.playerStates[currentIdx].playerId !== playerId) return res.status(400).json({ error: '不是你的回合' });

  // 处理出牌
  const result = playCard(game, playerId, card, targetId);
  // 出牌失败直接返回错误（包括锦囊牌/杀/决斗/顺手牵羊/过河拆桥等）
  if (result && result.error) {
    return res.status(400).json({ error: result.error });
  }

  // 如果是杀，等待闪响应，不切回合
  if (result && result.wait === 'shan') {
    return res.json({ wait: 'shan', from: result.from, to: result.to });
  }
  // 如果是锦囊牌（如决斗、顺手牵羊、过河拆桥、无懈可击等）需要等待响应链，直接返回等待信息
  if (result && result.wait && ['juedou', 'wuxie', 'guohe', 'shunshou'].includes(result.wait)) {
    return res.json(result);
  }

  // 递归结算响应栈（如杀未被闪响应则扣血），直到 actionStack 为空
  while (game.actionStack && game.actionStack.length > 0) {
    resolveActionStack(game);
  }

  // 只有 actionStack 为空才推进回合，否则等待响应
  if (!game.actionStack || game.actionStack.length === 0) {
    nextTurn(game);
  }
  res.json({ success: true });
});
// 弃牌接口（弃多张牌）
app.post('/api/rooms/:id/discard', express.json(), (req, res) => {
  const { id } = req.params;
  const { playerId, cards } = req.body;
  const room = getRoomList().find(r => r.id === id);
  if (!room || !room.game) return res.status(404).json({ error: '房间或游戏不存在' });
  const game = room.game;
  discardCards(game, playerId, cards);
  res.json({ success: true });
});

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
// 创建房间，支持 maxPlayers/mode
app.post('/api/rooms', express.json(), (req, res) => {
  const { name, maxPlayers, mode } = req.body;
  if (!name) return res.status(400).json({ error: '房间名不能为空' });
  const room = createRoom(name, { maxPlayers, mode });
  res.json(room);
});
// 获取单个房间详细信息（含 game 状态）
app.get('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const room = getRoomList().find(r => r.id === id);
  if (!room) return res.status(404).json({ error: '房间不存在' });
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
