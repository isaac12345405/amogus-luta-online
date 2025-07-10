const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  const id = Date.now().toString();
  players[id] = { x: 100, y: 50, hp: 100 };

  ws.send(JSON.stringify({ type: 'init', id, players }));

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'move') {
      players[id] = data.player;
      broadcast({ type: 'update', players });
    }
  });

  ws.on('close', () => {
    delete players[id];
    broadcast({ type: 'update', players });
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Servidor rodando na porta ${process.env.PORT || 3000}`);
});
