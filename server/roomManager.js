// 踢人：仅房主可用
export function kickPlayer(id, targetPlayerId) {
  if (!rooms[id]) return null;
  rooms[id].players = rooms[id].players.filter(p => p.playerId !== targetPlayerId);
  return rooms[id];
}

// 解散房间：仅房主可用
export function dismissRoom(id) {
  if (!rooms[id]) return false;
  delete rooms[id];
  return true;
}
// 房间管理内存数据
const rooms = {};
let roomIdCounter = 1;

// player: { playerId, name, ready }
export function createRoom(name) {
  const id = String(roomIdCounter++);
  rooms[id] = { id, name, players: [], started: false };
  return rooms[id];
}

export function joinRoom(id, playerObj) {
  if (!rooms[id]) return null;
  // 先移除同一 playerId 的玩家（防止刷新页面或重复加入导致人数递增）
  rooms[id].players = rooms[id].players.filter(p => p.playerId !== playerObj.playerId);
  rooms[id].players.push({ ...playerObj, ready: false });
  // 保证第一个玩家为房主
  if (rooms[id].players.length === 1) {
    rooms[id].players[0].isOwner = true;
  } else {
    rooms[id].players.forEach((p, idx) => { p.isOwner = idx === 0; });
  }
  return rooms[id];
}

// 新增：设置玩家准备状态和开始游戏
export function setPlayerReady(id, playerId, ready, start) {
  if (!rooms[id]) return null;
  const player = rooms[id].players.find(p => p.playerId === playerId);
  if (typeof ready === 'boolean' && player) player.ready = ready;
  if (typeof start === 'boolean') rooms[id].started = start;
  console.log('setPlayerReady:', JSON.stringify(rooms[id], null, 2));
  return rooms[id];
}

export function leaveRoom(id, playerId) {
  if (!rooms[id]) return null;
  rooms[id].players = rooms[id].players.filter(p => p.playerId !== playerId);
  return rooms[id];
}

export function getRoomList() {
  console.log('getRoomList:', JSON.stringify(rooms, null, 2));
  return Object.values(rooms);
}
