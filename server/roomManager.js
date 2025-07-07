// 摸牌，弃牌，回合阶段主流程（简化版）
export function drawCards(game, playerId, count = 2) {
  const player = game.playerStates.find(p => p.playerId === playerId);
  if (!player) return;
  for (let i = 0; i < count; i++) {
    player.hand.push(drawCard());
  }
  game.log.push(`${player.name} 摸了${count}张牌`);
}

export function discardCards(game, playerId, cards) {
  const player = game.playerStates.find(p => p.playerId === playerId);
  if (!player) return;
  cards.forEach(card => {
    let idx = -1;
    if (typeof card === 'string') {
      idx = player.hand.findIndex(c => (typeof c === 'string' ? c === card : c.name === card));
    } else if (card && typeof card === 'object') {
      idx = player.hand.findIndex(c => {
        if (typeof c === 'string') return c === card.name;
        return c.name === card.name && c.suit === card.suit && c.rank === card.rank;
      });
    }
    if (idx !== -1) {
      const discarded = player.hand.splice(idx, 1)[0];
      game.discardPile.push(discarded);
    }
  });
  game.log.push(`${player.name} 弃了${cards.length}张牌`);
}

// 回合阶段管理
export function nextTurn(game) {
  // 切换到下一个存活玩家
  let idx = (game.turn + 1) % game.playerStates.length;
  let loop = 0;
  while (game.playerStates[idx].hp <= 0 && loop < game.playerStates.length) {
    idx = (idx + 1) % game.playerStates.length;
    loop++;
  }
  game.turn = idx;
  // 摸牌阶段
  const player = game.playerStates[game.turn];
  if (player && player.hp > 0) {
    drawCards(game, player.playerId, 2);
    game.log.push(`${player.name} 的回合开始`);
  }
}
// 三国杀核心流程：杀-闪-扣血-死亡，简化版
// 新增：处理杀牌结算、响应闪、体力变化、死亡判定
// 新增：game.actionStack 用于处理响应链

// 处理玩家出牌（杀/闪/桃等）
export function playCard(game, playerId, card, targetId) {
  // 响应链：允许明确放弃出牌（如决斗/杀/无懈等响应时机，前端传递 card: null 或 card: { type: 'pass' }）
  if (game.actionStack && game.actionStack.length > 0 && (!card || card.type === 'pass')) {
    const last = game.actionStack[game.actionStack.length - 1];
    // 决斗响应链：放弃出杀，直接结算扣血
    if (last.type === 'askJuedou' && last.to === playerId) {
      const target = game.playerStates.find(p => p.playerId === playerId);
      if (target && target.hp > 0) {
        target.hp--;
        game.log.push(`${target.name} 决斗未出杀，失去1点体力`);
        if (target.hp <= 0) {
          game.log.push(`${target.name} 已阵亡`);
        }
      }
      game.actionStack.pop();
      return { success: true, pass: true };
    }
    // 杀响应链：放弃出闪，直接结算扣血
    if (last.type === 'askShan' && last.to === playerId) {
      const target = game.playerStates.find(p => p.playerId === playerId);
      if (target && target.hp > 0) {
        target.hp--;
        game.log.push(`${target.name} 未出闪，失去1点体力`);
        if (target.hp <= 0) {
          game.log.push(`${target.name} 已阵亡`);
        }
      }
      game.actionStack.pop();
      return { success: true, pass: true };
    }
    // 无懈响应链：放弃出无懈
    if ((last.type === 'askWuxie' || last.type === 'wuxie') && last.to === playerId) {
      game.log.push(`${game.playerStates.find(p => p.playerId === playerId)?.name || playerId} 在无懈响应中选择放弃出无懈可击`);
      game.actionStack.pop();
      return { success: true, pass: true };
    }
    // 其他响应链类型可扩展
    return { error: '当前不是可放弃响应的时机' };
  }
  // 顺手牵羊
  if (card.type === '顺手牵羊' || card.name === '顺手牵羊') {
    if (!targetId) return { error: '请选择目标' };
    const target = game.playerStates.find(p => p.playerId === targetId);
    if (!target || target.hp <= 0 || !target.hand || target.hand.length === 0) {
      game.log.push(`${player.name} 对 ${target ? target.name : '未知'} 使用了顺手牵羊，但无手牌可拿`);
      return { success: true };
    }
    // 随机获得一张
    const idx = Math.floor(Math.random() * target.hand.length);
    const taken = target.hand.splice(idx, 1)[0];
    player.hand.push(taken);
    game.log.push(`${player.name} 对 ${target.name} 使用了顺手牵羊，获得1张手牌`);
    return { success: true };
  }
  // 无懈可击响应链（可扩展）
  if (game.actionStack && game.actionStack.length > 0) {
    const last = game.actionStack[game.actionStack.length - 1];
    // 无懈响应链：只能出无懈可击
    if ((last.type === 'askWuxie' || last.type === 'wuxie') && last.to === playerId) {
      if (card.type === '无懈可击' || card.name === '无懈可击') {
        // 这里可扩展多层无懈链，目前只简单弹出
        game.actionStack.pop();
        game.log.push(`${player.name} 打出了无懈可击`);
        return { success: true };
      } else {
        return { error: '只能出无懈可击' };
      }
    }
  }
  // 过河拆桥
  if (card.type === '过河拆桥' || card.name === '过河拆桥') {
    if (!targetId) return { error: '请选择目标' };
    const target = game.playerStates.find(p => p.playerId === targetId);
    if (!target || target.hp <= 0 || !target.hand || target.hand.length === 0) {
      game.log.push(`${player.name} 对 ${target ? target.name : '未知'} 使用了过河拆桥，但无手牌可拆`);
      return { success: true };
    }
    // 随机弃一张
    const idx = Math.floor(Math.random() * target.hand.length);
    const removed = target.hand.splice(idx, 1)[0];
    game.discardPile.push(removed);
    game.log.push(`${player.name} 对 ${target.name} 使用了过河拆桥，${target.name} 失去1张手牌`);
    return { success: true };
  }
  // 决斗主流程
  if (card.type === '决斗' || card.name === '决斗') {
    if (!targetId) {
      console.log('[决斗出牌失败] 未选择目标', { playerId, card, targetId });
      return { error: '请选择目标' };
    }
    const duelPlayer = game.playerStates.find(p => p.playerId === playerId);
    if (!duelPlayer) {
      console.log('[决斗出牌失败] 玩家不存在', { playerId });
      return { error: '玩家不存在' };
    }
    const target = game.playerStates.find(p => p.playerId === targetId);
    if (!target || target.hp <= 0) {
      console.log('[决斗出牌失败] 目标无效', { targetId, target });
      return { error: '目标无效' };
    }
    // 检查自己手牌中是否有决斗牌
    let duelIdx = -1;
    if (typeof card === 'string') {
      duelIdx = duelPlayer.hand.findIndex(c => (typeof c === 'string' ? c === card : c.name === card));
    } else if (card && typeof card === 'object') {
      duelIdx = duelPlayer.hand.findIndex(c => {
        if (typeof c === 'string') return c === card.name;
        return c.name === card.name && c.suit === card.suit && c.rank === card.rank;
      });
    }
    console.log('[决斗出牌] 玩家手牌：', JSON.stringify(duelPlayer.hand), '请求card:', JSON.stringify(card), 'duelIdx:', duelIdx);
    if (duelIdx === -1) {
      console.log('[决斗出牌失败] 未找到决斗牌', { hand: duelPlayer.hand, card });
      return { error: '手牌不存在' };
    }
    const playedCard = duelPlayer.hand.splice(duelIdx, 1)[0];
    game.discardPile.push(playedCard);
    // 推入决斗响应栈，等待目标响应杀
    game.actionStack = game.actionStack || [];
    game.actionStack.push({ type: 'askJuedou', from: playerId, to: targetId, initiator: playerId });
    game.log.push(`${duelPlayer.name} 向 ${target.name} 发起了决斗，等待其出杀`);
    console.log('[决斗成功] 玩家', duelPlayer.name, '对', target.name, '出牌', playedCard);
    return { wait: 'juedou', from: playerId, to: targetId };
  }
  const player = game.playerStates.find(p => p.playerId === playerId);
  if (!player) return { error: '玩家不存在' };
  // 响应链时只校验类型，不校验花色点数
  let cardIdx = -1;
  if (game.actionStack && game.actionStack.length > 0) {
    const last = game.actionStack[game.actionStack.length - 1];
    // 决斗响应链：只要有杀即可
    if (last.type === 'askJuedou' && last.to === playerId) {
      cardIdx = player.hand.findIndex(c => {
        if (typeof c === 'string') return c === '杀';
        return c.type === '杀' || c.name === '杀';
      });
      if (cardIdx === -1) return { error: '手牌不存在' };
    } else if (last.type === 'askShan' && last.to === playerId) {
      cardIdx = player.hand.findIndex(c => {
        if (typeof c === 'string') return c === '闪';
        return c.type === '闪' || c.name === '闪';
      });
      if (cardIdx === -1) return { error: '只有被杀响应时才能出闪' };
    } else if ((last.type === 'askWuxie' || last.type === 'wuxie') && last.to === playerId) {
      cardIdx = player.hand.findIndex(c => {
        if (typeof c === 'string') return c === '无懈可击';
        return c.type === '无懈可击' || c.name === '无懈可击';
      });
      if (cardIdx === -1) return { error: '手牌不存在' };
    } else {
      // 其他响应链类型可扩展
      return { error: '当前不是可出牌的响应时机' };
    }
  } else {
    // 主流程严格校验
    if (typeof card === 'string') {
      cardIdx = player.hand.findIndex(c => (typeof c === 'string' ? c === card : c.name === card));
    } else if (card && typeof card === 'object') {
      cardIdx = player.hand.findIndex(c => {
        if (typeof c === 'string') return c === card.name;
        return c.name === card.name && c.suit === card.suit && c.rank === card.rank;
      });
    }
    if (cardIdx === -1) return { error: '手牌不存在' };
  }
  const playedCard = player.hand.splice(cardIdx, 1)[0];
  game.discardPile.push(playedCard);

  // 响应链严格校验
  if (game.actionStack && game.actionStack.length > 0) {
    const last = game.actionStack[game.actionStack.length - 1];
    // 决斗响应链：只能出杀
    if (last.type === 'askJuedou' && last.to === playerId) {
      if (card.type === '杀' || card.name === '杀') {
        game.actionStack.push({ type: 'askJuedou', from: playerId, to: last.from, initiator: last.initiator });
        game.log.push(`${player.name} 在决斗中打出了杀，轮到对方响应`);
        game.actionStack.pop(); // 移除自己这层
        return { success: true };
      } else {
        return { error: '决斗只能出杀' };
      }
    }
    // 杀响应链：只能出闪
    if (last.type === 'askShan' && last.to === playerId) {
      if (card.type === '闪' || card.name === '闪') {
        game.actionStack.pop();
        game.log.push(`${player.name} 打出了闪，杀无效`);
        return { success: true };
      } else {
        return { error: '只能出闪' };
      }
    }
    // 其他响应链类型可扩展
  }
  // 主流程杀（只在无响应链时生效）
  if ((card.type === '杀' || card.name === '杀') && (!game.actionStack || game.actionStack.length === 0)) {
    // 需要指定目标
    if (!targetId) return { error: '请选择目标' };
    const target = game.playerStates.find(p => p.playerId === targetId);
    if (!target || target.hp <= 0) return { error: '目标无效' };
    // 推入响应栈，等待目标响应闪
    game.actionStack = game.actionStack || [];
    game.actionStack.push({ type: 'askShan', from: playerId, to: targetId });
    game.log.push(`${player.name} 对 ${target.name} 使用了杀，等待闪`);
    return { wait: 'shan', from: playerId, to: targetId };
  }
  if (card.type === '桃' || card.name === '桃') {
    // 濒死/回复
    if (player.hp < 4) {
      player.hp++;
      game.log.push(`${player.name} 使用桃，回复1点体力`);
      return { success: true };
    } else {
      return { error: '体力已满，不能使用桃' };
    }
  }
  // 其他牌直接丢弃
  game.log.push(`${player.name} 打出 ${typeof playedCard === 'string' ? playedCard : playedCard.suit + playedCard.rank + playedCard.name}`);
  return { success: true };
}

// 结算杀未被闪响应时的扣血
export function resolveActionStack(game) {
  if (!game.actionStack || game.actionStack.length === 0) return;
  const last = game.actionStack[game.actionStack.length - 1];
  if (last.type === 'askShan') {
    // 没有闪，目标扣血
    const target = game.playerStates.find(p => p.playerId === last.to);
    if (target && target.hp > 0) {
      target.hp--;
      game.log.push(`${target.name} 未出闪，失去1点体力`);
      if (target.hp <= 0) {
        game.log.push(`${target.name} 已阵亡`);
      }
    }
    game.actionStack.pop();
    return;
  }
  // 决斗响应链结算
  if (last.type === 'askJuedou') {
    // 没有杀，目标扣血，决斗结束
    const target = game.playerStates.find(p => p.playerId === last.to);
    if (target && target.hp > 0) {
      target.hp--;
      game.log.push(`${target.name} 决斗未出杀，失去1点体力`);
      if (target.hp <= 0) {
        game.log.push(`${target.name} 已阵亡`);
      }
    }
    game.actionStack.pop();
    return;
  }
}
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
// 支持自定义人数和模式
export function createRoom(name, options = {}) {
  const id = String(roomIdCounter++);
  // options: { maxPlayers, mode }  mode: 'classic' | '2v2'
  rooms[id] = {
    id,
    name,
    players: [],
    started: false,
    maxPlayers: options.maxPlayers || 4,
    mode: options.mode || 'classic', // classic(传统) or 2v2
    game: null // 游戏状态，开始游戏时初始化
  };
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

// 设置玩家准备状态和开始/结束游戏
export function setPlayerReady(id, playerId, ready, start) {
  if (!rooms[id]) return null;
  const player = rooms[id].players.find(p => p.playerId === playerId);
  if (typeof ready === 'boolean' && player) player.ready = ready;
  if (typeof start === 'boolean') {
    // 彻底重置游戏状态和所有玩家手牌
    rooms[id].started = start;
    if (start) {
      rooms[id].game = initGameState(rooms[id]);
    } else {
      rooms[id].game = null;
      // 清空所有玩家手牌，重置体力等（可选）
      rooms[id].players.forEach(p => {
        p.hp = 4;
        p.hand = [];
        p.general = '';
      });
    }
  }
  console.log('setPlayerReady:', JSON.stringify(rooms[id], null, 2));
  return rooms[id];
}

// 初始化游戏状态（简化版，后续可扩展）
function initGameState(room) {
  const { players, mode } = room;
  // 生成武将、手牌、体力等，支持 classic/2v2
  const generals = shuffleArray(["刘备","关羽","张飞","曹操","孙权","周瑜","吕布","貂蝉"]);
  const playerStates = players.map((p, idx) => ({
    playerId: p.playerId,
    name: p.name,
    general: generals[idx % generals.length],
    hp: 4,
    hand: [drawCard(), drawCard(), drawCard(), drawCard()],
    team: mode === '2v2' ? (idx % 2 === 0 ? 1 : 2) : null
  }));
  return {
    mode,
    turn: 0,
    playerStates,
    discardPile: [],
    log: []
  };
}

function drawCard() {
  // 返回带花色点数的完整牌对象
  const cardTypes = [
    { name: "杀", type: "杀" },
    { name: "闪", type: "闪" },
    { name: "桃", type: "桃" },
    { name: "无懈可击", type: "无懈可击" },
    { name: "决斗", type: "决斗" },
    { name: "过河拆桥", type: "过河拆桥" },
    { name: "顺手牵羊", type: "顺手牵羊" }
  ];
  const suits = ['♠', '♥', '♣', '♦'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const card = cardTypes[Math.floor(Math.random() * cardTypes.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  // 可扩展 img 字段
  return {
    name: card.name,
    type: card.type,
    suit,
    rank,
    img: ''
  };
}

function shuffleArray(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
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
