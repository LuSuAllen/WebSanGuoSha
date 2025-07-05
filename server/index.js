import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

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

app.get('/', (req, res) => {
  res.send('三国杀 WebSocket 服务器运行中');
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`服务器已启动，端口：${PORT}`);
});
