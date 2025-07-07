import React, { useEffect, useState } from 'react';
// 弃牌弹窗子组件
function DiscardModal({ open, me, discardSelect, setDiscardSelect, onConfirm, onClose }: {
  open: boolean;
  me: any;
  discardSelect: number[];
  setDiscardSelect: (v: number[]) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      closable={false}
      maskClosable={false}
      footer={null}
      title={<span style={{ fontFamily: 'STKaiti', fontWeight: 700 }}>弃牌阶段（超出手牌上限）</span>}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ marginBottom: 12, fontFamily: 'STKaiti', fontSize: 16 }}>
        你的手牌数（{me?.hand?.length}）已超体力上限（{me?.hp}），请选择要弃掉的{me && me.hand && me.hp !== undefined ? me.hand.length - me.hp : 0}张牌：
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', minHeight: 90 }}>
        {me?.hand?.map((card: any, idx: number) => {
          let name = '', suit = '', rank = '', img = '', type = '';
          if (typeof card === 'string') {
            name = card;
            suit = '♠';
            rank = 'A';
            type = card;
          } else {
            name = card.name || '';
            suit = card.suit || '♠';
            rank = card.rank || 'A';
            img = card.img || '';
            type = card.type || card.name || '';
          }
          const isRed = suit === '♥' || suit === '♦';
          let typeColor = '#b37feb';
          if (type.includes('杀')) typeColor = '#ff7875';
          else if (type.includes('闪')) typeColor = '#36cfc9';
          else if (type.includes('桃')) typeColor = '#ff85c0';
          else if (type.includes('酒')) typeColor = '#faad14';
          else if (type.includes('无懈')) typeColor = '#69c0ff';
          let typeIcon = '';
          if (type.includes('杀')) typeIcon = '/card-icons/sha.png';
          else if (type.includes('闪')) typeIcon = '/card-icons/shan.png';
          else if (type.includes('桃')) typeIcon = '/card-icons/tao.png';
          else if (type.includes('酒')) typeIcon = '/card-icons/jiu.png';
          else if (type.includes('无懈')) typeIcon = '/card-icons/wuxie.png';
          const selected = discardSelect.includes(idx);
          return (
            <div
              key={idx}
              style={{
                width: 62,
                height: 90,
                background: selected ? 'linear-gradient(160deg,#fffbe6 60%,#b37feb33 100%)' : 'linear-gradient(160deg,#fffbe6 70%,#ffe7ba 100%)',
                border: `3px solid ${selected ? '#b37feb' : typeColor}`,
                borderRadius: 14,
                boxShadow: selected ? '0 0 18px #b37feb' : '0 2px 12px #b37feb22',
                fontFamily: 'STKaiti, FZKaTong-M19S, serif',
                color: '#531dab',
                cursor: 'pointer',
                opacity: 1,
                position: 'relative',
                zIndex: selected ? 2 : 1,
                transition: 'box-shadow 0.3s, transform 0.18s',
                textAlign: 'center',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 0,
                overflow: 'hidden',
                backgroundImage: img ? `url(${img})` : undefined,
                backgroundSize: img ? 'cover' : undefined,
                backgroundPosition: img ? 'center' : undefined
              }}
              onClick={() => {
                let next = discardSelect.slice();
                if (selected) next = next.filter(i => i !== idx);
                else if (discardSelect.length < me.hand.length - me.hp) next.push(idx);
                setDiscardSelect(next);
              }}
            >
              <div style={{ position: 'absolute', left: 5, top: 3, fontSize: 13, color: isRed ? '#ff4d4f' : '#222', fontWeight: 700, background: 'rgba(255,255,255,0.85)', borderRadius: 4, padding: '0 2px', zIndex: 2 }}>{suit}{rank}</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#ad6800', width: '100%', marginTop: 8 }}>
                {img ? (
                  <img src={img} alt={name} style={{ maxWidth: 32, maxHeight: 40, borderRadius: 7, boxShadow: '0 2px 8px #0002' }} />
                ) : typeIcon ? (
                  <img src={typeIcon} alt={type} style={{ maxWidth: 22, maxHeight: 22, marginRight: 2 }} />
                ) : name}
              </div>
              <div style={{ width: '100%', height: 14, background: typeColor, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: '14px', textShadow: '0 1px 4px #0002', boxShadow: '0 1px 4px #fffbe6 inset' }}>{type.includes('杀') ? '杀' : type.includes('闪') ? '闪' : type.includes('桃') ? '桃' : type.includes('酒') ? '酒' : type.includes('无懈') ? '无懈' : '手牌'}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <Button
          type="primary"
          disabled={discardSelect.length !== (me && me.hand && me.hp !== undefined ? me.hand.length - me.hp : 0)}
          onClick={onConfirm}
        >
          确认弃牌
        </Button>
      </div>
    </Modal>
  );
}

// 杀牌目标选择弹窗子组件
function ShaTargetModal({ open, playerStates, playerId, onSelect, onCancel }: {
  open: boolean;
  playerStates: Player[];
  playerId: string;
  onSelect: (targetId: string) => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={<span style={{ fontFamily: 'STKaiti', fontWeight: 700 }}>请选择杀的目标</span>}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {playerStates.filter(p => p.playerId !== playerId && p.hp > 0).map((p) => (
          <Button key={p.playerId} type="primary" onClick={() => onSelect(p.playerId)}>{p.name}</Button>
        ))}
      </div>
    </Modal>
  );
}

// 通用响应弹窗子组件
function ResponseModal({ open, responseModal, me, responseCardIdx, responseLoading }: {
  open: boolean;
  responseModal: any;
  me: any;
  responseCardIdx: number|null;
  responseLoading: boolean;
}) {
  return (
    <Modal
      open={open}
      onCancel={responseModal ? responseModal.skip : undefined}
      footer={null}
      title={<span style={{ fontFamily: 'STKaiti', fontWeight: 700 }}>{responseModal?.prompt}</span>}
      bodyStyle={{ padding: 20 }}
      maskClosable={false}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, minHeight: 40 }}>
        {responseModal && me?.hand?.filter(responseModal.validCards).length === 0 ? (
          <>
            <span style={{ color: '#aaa' }}>你没有可用的牌，自动跳过</span>
            <Button type="primary" loading={responseLoading} disabled={responseLoading} style={{ marginLeft: 12 }} onClick={responseModal.skip}>确定</Button>
          </>
        ) : responseModal ? (
          me?.hand?.map((c: any, idx: number) => {
            if (!responseModal.validCards(c, idx)) return null;
            return <Button
              key={idx}
              type={responseCardIdx === idx && responseLoading ? "primary" : "default"}
              loading={responseCardIdx === idx && responseLoading}
              disabled={responseLoading}
              style={{ minWidth: 64, fontWeight: 700 }}
              onClick={() => responseModal.onPlay(c, idx)}
            >
              {responseModal.type === 'shan' ? '出闪' : responseModal.type === 'sha' ? '出杀' : responseModal.type === 'wuxie' ? '出无懈' : '出牌'}
            </Button>;
          })
        ) : null}
      </div>
    </Modal>
  );
}
import { Card, Avatar, Tag, Button, Spin, message, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { API_BASE } from './config.ts';

const seatColors = ['#fadb14', '#b7eb8f', '#91d5ff', '#ff85c0', '#ffd666', '#ff7875', '#d3adf7', '#95de64'];
const identityColors = ['red', 'green', 'blue', 'purple'];

interface GameTableProps {
  onExit: () => void;
  roomId: string;
}

interface Player {
  playerId: string;
  name: string;
  hand: any[];
  hp: number;
  team?: number;
  general?: string;
  generalAvatar?: string;
}

interface Game {
  playerStates: Player[];
  turn: number;
  discardPile: any[];
  log: string[];
  phase?: string;
  actionStack?: any[];
}


export default function GameTable({ onExit, roomId }: GameTableProps) {
  // 主流程变量和函数
  // 拉取房间和游戏状态
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [lastPlayedIdx, setLastPlayedIdx] = useState<number | null>(null);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const playerId = localStorage.getItem('sgs_player_id') || '';

  // 弃牌弹窗相关（唯一声明）
  const [discardSelect, setDiscardSelect] = useState<number[]>([]); // 选中的弃牌index
  const [forceDiscardOpen, setForceDiscardOpen] = useState(false);

  // 杀牌目标选择与响应弹窗（唯一声明）
  const [shaTargetModal, setShaTargetModal] = useState<{card: any, idx: number}|null>(null);
  // 通用响应弹窗
  const [responseModal, setResponseModal] = useState<null | {
    type: string;
    prompt: string;
    validCards: (card: any, idx: number) => boolean;
    onPlay: (card: any, idx: number) => void;
    skip: () => void;
  }>(null);
  const [responseCardIdx, setResponseCardIdx] = useState<number|null>(null);
  const [responseLoading, setResponseLoading] = useState(false);

  // 游戏主状态变量（唯一声明，所有 useEffect 和函数均用这些）
  const playerStates: Player[] = game?.playerStates || [];
  const me = playerStates.find((p) => p.playerId === playerId);
  const seatCount = playerStates.length;
  const radius = 180;
  const center = 220;
  const currentIdx = playerStates.length > 0 && game ? game.turn % playerStates.length : 0;
  const currentPlayer = playerStates[currentIdx];
  const discardPile: any[] = game?.discardPile || [];
  const log: string[] = game?.log || [];
  // 阶段提示（只声明一次）
  const phase = (() => {
    if (game?.phase) return game.phase;
    if (currentPlayer?.playerId === playerId) {
      if (me && me.hand && me.hp !== undefined && me.hand.length > me.hp) return '弃牌阶段';
      return '出牌阶段';
    }
    return '等待回合';
  })();

  // 拉取游戏信息
  const fetchGame = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}`);
      const data = await res.json();
      setRoom(data);
      setGame(data.game);

      // 通用 actionStack 响应弹窗逻辑
      let modal: typeof responseModal = null;
      if (data.game?.actionStack && Array.isArray(data.game.actionStack)) {
        // 只处理栈顶（最新）响应
        const top = data.game.actionStack[data.game.actionStack.length - 1];
        if (top && top.targetId === playerId) {
          if (top.type === 'shan' || top.type === '响应闪') {
            modal = {
              type: 'shan',
              prompt: '你被杀了！请选择要出的闪',
              validCards: (card) => {
                let type = '';
                if (typeof card === 'string') type = card;
                else type = card.type || card.name || '';
                return type.includes('闪');
              },
              onPlay: handlePlayResponseCard('shan'),
              skip: () => handlePlayResponseCard('shan')(null, -1)
            };
          } else if (top.type === 'juedou' || top.type === '响应决斗') {
            modal = {
              type: 'sha',
              prompt: '你被决斗了！请选择要出的杀',
              validCards: (card) => {
                let type = '';
                if (typeof card === 'string') type = card;
                else type = card.type || card.name || '';
                return type.includes('杀');
              },
              onPlay: handlePlayResponseCard('sha'),
              skip: () => handlePlayResponseCard('sha')(null, -1)
            };
          } else if (top.type === 'wuxie' || top.type === '响应无懈') {
            modal = {
              type: 'wuxie',
              prompt: '请出无懈可击',
              validCards: (card) => {
                let type = '';
                if (typeof card === 'string') type = card;
                else type = card.type || card.name || '';
                return type.includes('无懈');
              },
              onPlay: handlePlayResponseCard('wuxie'),
              skip: () => handlePlayResponseCard('wuxie')(null, -1)
            };
          }
        }
      }
      setResponseModal(modal);
    } catch {
      message.error('获取游戏信息失败');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 响应 actionStack 通用出牌
  function handlePlayResponseCard(type: string) {
    return async (card: any, idx: number) => {
      setResponseCardIdx(idx);
      setResponseLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${roomId}/play`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, card })
        });
        const data = await res.json();
        if (data.error) {
          message.error(data.error);
        } else {
          setResponseModal(null);
        }
      } catch {
        message.error('出牌失败');
      } finally {
        setResponseLoading(false);
        fetchGame();
      }
    };
  }

  useEffect(() => {
    fetchGame(true); // 首次加载显示 loading
    const timer = setInterval(() => fetchGame(false), 2000); // 后续刷新不 loading
    return () => clearInterval(timer);
  }, [roomId]);

  // 检查是否需要弹出闪响应（被杀）（只保留一份）


  // 其余变量和函数（已在顶层唯一声明，删除重复声明）


  // 先用变量保存主内容，最后统一 return，避免 hooks 后提前 return
  let content: React.ReactNode = null;
  if (loading || !game) {
    content = <Spin style={{ margin: 64 }} tip="加载游戏中..." />;
  }

  // 其余变量和函数（已在顶层唯一声明，删除重复声明）

  // 阶段提示（已在顶层唯一声明，删除重复声明）

  // 进入弃牌阶段自动弹窗（只保留一份）
  useEffect(() => {
    if (
      currentPlayer?.playerId === playerId &&
      phase === '弃牌阶段' &&
      me && me.hand && me.hp !== undefined &&
      me.hand.length > me.hp
    ) {
      setDiscardSelect([]);
      setForceDiscardOpen(true);
    } else {
      setForceDiscardOpen(false);
    }
  }, [phase, currentPlayer?.playerId, playerId, me?.hand?.length, me?.hp]);

  // 确认弃牌
  const handleConfirmDiscard = async () => {
    if (!me || !me.hand) return;
    if (discardSelect.length !== me.hand.length - me.hp) {
      message.warning(`请选择${me.hand.length - me.hp}张要弃的牌`);
      return;
    }
    const cards = discardSelect.map(idx => me.hand[idx]);
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/discard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cards })
      });
      const data = await res.json();
      if (data.error) message.error(data.error);
      else message.success('弃牌成功');
      setForceDiscardOpen(false);
      fetchGame();
    } catch {
      message.error('弃牌失败');
    }
  };

  // 杀牌/决斗目标选择弹窗
  const handlePlayTarget = (card: any, idx: number) => {
    setShaTargetModal({ card, idx });
  }

  // 出牌操作：仅本人回合且阶段为“出牌阶段”可用，且不能出“闪”
  const handlePlayCard = async (card: any, idx: number) => {
    let type = '';
    if (typeof card === 'string') type = card;
    else type = card.type || card.name || '';
    if (type.includes('闪')) {
      message.warning('闪只能在被杀响应时使用');
      return;
    }
    // 杀/决斗/顺手牵羊/过河拆桥都需要选目标
    if (type.includes('杀') || type.includes('决斗') || type.includes('顺手牵羊') || type.includes('过河拆桥')) {
      handlePlayTarget(card, idx);
      return;
    }
    if (currentPlayer?.playerId !== playerId || phase !== '出牌阶段') {
      message.warning('请在你的出牌阶段出牌');
      return;
    }
    setLastPlayedIdx(idx);
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, card })
      });
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        message.success('出牌成功');
        setTimeout(() => setLastPlayedIdx(null), 500);
      }
    } catch {
      message.error('出牌失败');
    } finally {
      fetchGame(); // 强制刷新，防止本地状态不同步
    }
  };

  // 结束回合
  const handleEndTurn = async () => {
    if (currentPlayer?.playerId !== playerId) {
      message.warning('请等待你的回合');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/endturn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
      const data = await res.json();
      if (data.error) message.error(data.error);
      else message.success('回合结束');
      fetchGame();
    } catch {
      message.error('操作失败');
    }
  };
  // 杀牌目标选择与闪响应弹窗（只声明一次）
  // 已在顶部声明，删除重复声明

  // 发送带目标的牌（杀/决斗）
  const sendCardWithTarget = async (targetId: string) => {
    if (!shaTargetModal) return;
    setLastPlayedIdx(shaTargetModal.idx);
    const card = shaTargetModal.card;
    let type = '';
    if (typeof card === 'string') type = card;
    else type = card.type || card.name || '';
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, card, targetId })
      });
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        message.success('出牌成功');
        setShaTargetModal(null);
        setTimeout(() => setLastPlayedIdx(null), 500);
      }
    } catch {
      message.error('出牌失败');
    } finally {
      fetchGame();
    }
  };

  // 已由通用响应弹窗 handlePlayResponseCard 取代

  if (!content) {
    content = (
      <div style={{ minHeight: 500, background: 'url(https://img.zcool.cn/community/01b1e95b6e2e6fa8012193a3e2e2e2.jpg) center/cover', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32, position: 'relative', maxWidth: 900, margin: '32px auto', display: 'flex', flexDirection: 'row' }}>
        {/* 顶部阶段提示条 */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, top: -38,
          textAlign: 'center',
          zIndex: 10
        }}>
          <span style={{
            display: 'inline-block',
            background: phase === '弃牌阶段' ? '#b37feb' : phase === '出牌阶段' ? '#faad14' : '#d4b106',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 8,
            padding: '4px 22px',
            boxShadow: '0 2px 8px #0002',
            fontFamily: 'STKaiti',
            letterSpacing: 2
          }}>{phase}</span>
        </div>
        {/* 主桌面区域 */}
        <div style={{ flex: 1, minWidth: 600, position: 'relative' }}>
          <Button onClick={onExit} style={{ position: 'absolute', right: 24, top: 24, zIndex: 2 }}>退出游戏</Button>
          <div style={{ position: 'relative', width: 440, height: 440, margin: '0 auto' }}>
            {/* 玩家座位 */}
            {playerStates.map((p: any, idx: number) => {
              const angle = (2 * Math.PI / seatCount) * idx - Math.PI / 2;
              const x = center + radius * Math.cos(angle) - 48;
              const y = center + radius * Math.sin(angle) - 48;
              const isDead = p.hp <= 0;
              // 队伍/身份角标颜色
              let teamColor = '';
              if (p.team === 1) teamColor = '#1890ff';
              else if (p.team === 2) teamColor = '#52c41a';
              else if (p.team === 3) teamColor = '#faad14';
              else if (p.team === 4) teamColor = '#eb2f96';
              const hovered = hoveredPlayerId === p.playerId;
              return (
                <div
                  key={p.playerId}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    zIndex: currentIdx === idx ? 2 : 1
                  }}
                  onMouseEnter={() => setHoveredPlayerId(p.playerId)}
                  onMouseLeave={() => setHoveredPlayerId(null)}
                >
                  <Card
                    style={{
                      width: 96,
                      height: 120,
                      textAlign: 'center',
                      background: isDead ? '#fff1f0' : '#fffbe6',
                      border: isDead ? '2px solid #ff4d4f' : '2px solid #d4b106',
                      borderRadius: 12,
                      boxShadow: isDead
                      ? '0 0 16px #ff4d4f'
                      : (currentIdx === idx ? '0 0 24px #faad14, 0 2px 12px #0002' : '0 2px 8px #0002'),
                    opacity: isDead ? 0.7 : 1,
                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                    transition: 'box-shadow 0.2s, transform 0.18s',
                    cursor: hovered ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                  bodyStyle={{ padding: 8, paddingBottom: 0 }}
                >
                  {/* 队伍/身份角标 */}
                  {teamColor && (
                    <span style={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: teamColor,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px #0002',
                      border: '2px solid #fff',
                      zIndex: 3
                    }}>{p.team}</span>
                  )}
                  {/* 武将头像（如有generalAvatar字段，否则用默认） */}
                  {p.generalAvatar ? (
                    <Avatar size={48} src={p.generalAvatar} style={{ marginBottom: 4, opacity: isDead ? 0.5 : 1, border: '2px solid #b37feb', background: '#fff' }} />
                  ) : (
                    <Avatar size={48} icon={<UserOutlined />} style={{ background: seatColors[idx % seatColors.length], marginBottom: 4, opacity: isDead ? 0.5 : 1, border: '2px solid #b37feb' }} />
                  )}
                  <div style={{ fontWeight: 700, fontFamily: 'STKaiti', fontSize: 16 }}>{p.name}</div>
                  <Tag color={p.team === 1 ? 'blue' : p.team === 2 ? 'green' : 'gold'} style={{ fontFamily: 'STKaiti', marginTop: 4 }}>{p.general}</Tag>
                  <div style={{ marginTop: 4 }}>♥️{p.hp} 手牌:{p.hand.length}</div>
                  {isDead && <div style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 15 }}>{p.hp === 0 ? '濒死' : '已阵亡'}</div>}
                  {!isDead && currentIdx === idx && <div style={{ color: '#faad14', fontWeight: 700 }}>回合中</div>}
                  {/* 回合中高亮进度条 */}
                  {!isDead && currentIdx === idx && (
                    <div style={{
                      position: 'absolute',
                      left: 8,
                      right: 8,
                      bottom: 6,
                      height: 7,
                      borderRadius: 4,
                      background: 'linear-gradient(90deg,#ffe58f,#faad14 60%,#fffbe6)',
                      boxShadow: '0 0 8px #faad14',
                      opacity: 0.85
                    }} />
                  )}
                </Card>
              </div>
            );
          })}
          {/* 桌面中央区域 */}
          <div style={{
            position: 'absolute',
            left: center - 70,
            top: center - 70,
            width: 140,
            height: 140,
            background: 'radial-gradient(circle, #fffbe6 60%, #ffd666 90%, #fff1b8 100%)',
            borderRadius: '50%',
            border: '4px solid #d4b106',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'STKaiti',
            fontSize: 34,
            color: '#ad6800',
            fontWeight: 900,
            boxShadow: '0 0 32px 8px #ffd66688, 0 2px 16px #0002'
          }}>
            三国杀
          </div>
          {/* 弃牌区（可点击弹窗） */}
          <div
            style={{ position: 'absolute', left: center - 80, top: center + 80, width: 160, minHeight: 40, background: 'rgba(255,255,255,0.92)', borderRadius: 10, border: '2px solid #b37feb', boxShadow: '0 2px 8px #b37feb44', textAlign: 'center', padding: 8, fontFamily: 'STKaiti', fontSize: 16, color: '#531dab', cursor: discardPile.length > 0 ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => discardPile.length > 0 && setDiscardModalOpen(true)}
            title={discardPile.length > 0 ? '点击查看全部弃牌' : ''}
          >
            弃牌区：{discardPile.length === 0 ? '无' : discardPile.slice(-5).map((c: any, i: number) => (
              <span key={i} style={{ margin: '0 2px' }}>
                {typeof c === 'object' && c !== null
                  ? `${c.suit || ''}${c.rank || ''}${c.name || ''}`
                  : c}
              </span>
            ))}
            {discardPile.length > 5 && <span style={{ color: '#b37feb', marginLeft: 4, fontSize: 13 }}>[+{discardPile.length - 5}]</span>}
          </div>
          {/* 弃牌区弹窗 */}
          <Modal
            open={discardModalOpen}
            onCancel={() => setDiscardModalOpen(false)}
            footer={null}
            title={<span style={{ fontFamily: 'STKaiti', fontWeight: 700 }}>全部弃牌（{discardPile.length}）</span>}
            bodyStyle={{ padding: 20 }}
          >
            {discardPile.length === 0 ? <div style={{ color: '#aaa' }}>暂无弃牌</div> :
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {discardPile.map((c: any, i: number) => (
                  <span key={i} style={{ display: 'inline-block', padding: '2px 10px', background: '#fff', border: '1px solid #b37feb', borderRadius: 8, fontFamily: 'STKaiti', fontSize: 16, color: '#531dab' }}>
                    {typeof c === 'object' && c !== null
                      ? `${c.suit || ''}${c.rank || ''}${c.name || ''}`
                      : c}
                  </span>
                ))}
              </div>
            }
          </Modal>
        </div>
        {/* 手牌区 */}
        {/* 强制弃牌弹窗 */}
        <DiscardModal
          open={forceDiscardOpen}
          me={me}
          discardSelect={discardSelect}
          setDiscardSelect={setDiscardSelect}
          onConfirm={handleConfirmDiscard}
          onClose={() => setForceDiscardOpen(false)}
        />
        <div style={{ margin: '32px auto 0', textAlign: 'center' }}>
          <Card style={{ display: 'inline-block', background: '#fffbe6', border: '2px solid #d4b106', borderRadius: 12, minWidth: 320 }}>
            <div style={{ fontFamily: 'STKaiti', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>你的手牌</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, minHeight: 110, alignItems: 'center' }}>
              {me?.hand?.length === 0 ? (
                <span style={{ color: '#aaa', fontSize: 16, fontFamily: 'STKaiti' }}>你当前没有手牌</span>
              ) : (
                me?.hand?.map((card: any, idx: number) => {
                  // 支持 card 为对象或字符串
                  let name = '', suit = '', rank = '', img = '', type = '';
                  if (typeof card === 'string') {
                    name = card;
                    suit = '♠';
                    rank = 'A';
                    type = card;
                  } else {
                    name = card.name || '';
                    suit = card.suit || '♠';
                    rank = card.rank || 'A';
                    img = card.img || '';
                    type = card.type || card.name || '';
                  }
                  // 花色颜色
                  const isRed = suit === '♥' || suit === '♦';
                  // 类型色块
                  let typeColor = '#b37feb';
                  if (type.includes('杀')) typeColor = '#ff7875';
                  else if (type.includes('闪')) typeColor = '#36cfc9';
                  else if (type.includes('桃')) typeColor = '#ff85c0';
                  else if (type.includes('酒')) typeColor = '#faad14';
                  else if (type.includes('无懈')) typeColor = '#69c0ff';
                  // 类型图标（本地）
                  let typeIcon = '';
                  if (type.includes('杀')) typeIcon = '/card-icons/sha.png';
                  else if (type.includes('闪')) typeIcon = '/card-icons/shan.png';
                  else if (type.includes('桃')) typeIcon = '/card-icons/tao.png';
                  else if (type.includes('酒')) typeIcon = '/card-icons/jiu.png';
                  else if (type.includes('无懈')) typeIcon = '/card-icons/wuxie.png';
                  return (
                    <div
                      key={idx}
                      style={{
                        width: 68,
                        height: 100,
                        background: 'linear-gradient(160deg,#fffbe6 70%,#ffe7ba 100%)',
                        border: `3px solid ${typeColor}`,
                        borderRadius: 16,
                        boxShadow: lastPlayedIdx === idx ? '0 0 18px #b37feb' : '0 2px 12px #b37feb22',
                        fontFamily: 'STKaiti, FZKaTong-M19S, serif',
                        color: '#531dab',
                        cursor: currentPlayer?.playerId === playerId ? 'pointer' : 'not-allowed',
                        opacity: currentPlayer?.playerId === playerId ? 1 : 0.5,
                        position: 'relative',
                        zIndex: lastPlayedIdx === idx ? 2 : 1,
                        transition: 'box-shadow 0.3s, transform 0.18s, rotate 0.18s',
                        textAlign: 'center',
                        userSelect: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 0,
                        overflow: 'hidden',
                        backgroundImage: img ? `url(${img})` : undefined,
                        backgroundSize: img ? 'cover' : undefined,
                        backgroundPosition: img ? 'center' : undefined
                      }}
                      onClick={() => currentPlayer?.playerId === playerId && handlePlayCard(card, idx)}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.13) rotate(-6deg)';
                        (e.currentTarget as HTMLDivElement).style.zIndex = '3';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 32px #b37feb99, 0 2px 16px #b37feb44';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLDivElement).style.zIndex = lastPlayedIdx === idx ? '2' : '1';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = lastPlayedIdx === idx ? '0 0 18px #b37feb' : '0 2px 12px #b37feb22';
                      }}
                    >
                      {/* 顶部花色点数角标，绝对定位不遮挡 */}
                      <div style={{
                        position: 'absolute',
                        left: 6,
                        top: 4,
                        fontSize: 15,
                        color: isRed ? '#ff4d4f' : '#222',
                        fontWeight: 700,
                        textShadow: '0 1px 4px #fff',
                        letterSpacing: 1,
                        zIndex: 2,
                        background: 'rgba(255,255,255,0.85)',
                        borderRadius: 4,
                        padding: '0 3px'
                      }}>{suit}{rank}</div>
                      {/* 牌名大字或图片/图标，整体下移避免遮挡 */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 900,
                        letterSpacing: 2,
                        color: '#ad6800',
                        textShadow: '0 2px 8px #fffbe6',
                        width: '100%',
                        marginTop: 12
                      }}>
                        {img ? (
                          <img src={img} alt={name} style={{ maxWidth: 40, maxHeight: 50, borderRadius: 8, boxShadow: '0 2px 8px #0002' }} />
                        ) : typeIcon ? (
                          <img src={typeIcon} alt={type} style={{ maxWidth: 32, maxHeight: 32, marginRight: 4 }} />
                        ) : name}
                      </div>
                      {/* 底部类型色块 */}
                      <div style={{
                        width: '100%',
                        height: 18,
                        background: typeColor,
                        borderBottomLeftRadius: 13,
                        borderBottomRightRadius: 13,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: 1,
                        lineHeight: '18px',
                        textShadow: '0 1px 4px #0002',
                        boxShadow: '0 1px 4px #fffbe6 inset'
                      }}>{type.includes('杀') ? '杀' : type.includes('闪') ? '闪' : type.includes('桃') ? '桃' : type.includes('酒') ? '酒' : type.includes('无懈') ? '无懈可击' : '手牌'}</div>
                    </div>
                  );
                })
              )}
            </div>
      {/* 杀牌目标选择弹窗 */}
      <ShaTargetModal
        open={!!shaTargetModal}
        playerStates={playerStates}
        playerId={playerId}
        onSelect={sendCardWithTarget}
        onCancel={() => setShaTargetModal(null)}
      />

      {/* 通用响应弹窗 */}
      <ResponseModal
        open={!!responseModal}
        responseModal={responseModal}
        me={me}
        responseCardIdx={responseCardIdx}
        responseLoading={responseLoading}
      />
            {/* 仅本人回合可操作 */}
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={handleEndTurn}
              disabled={currentPlayer?.playerId !== playerId}
            >
              {currentPlayer?.playerId === playerId ? '结束回合' : '等待回合'}
            </Button>
          </Card>
        </div>
      </div>
      {/* 操作日志区域 */}
      <div style={{ width: 220, marginLeft: 24, background: 'rgba(255,255,255,0.92)', borderRadius: 12, border: '2px solid #d4b106', boxShadow: '0 2px 8px #0002', padding: 16, fontFamily: 'STKaiti', fontSize: 15, color: '#ad6800', maxHeight: 520, overflowY: 'auto' }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>操作日志</div>
        {log.length === 0 ? <div style={{ color: '#aaa' }}>暂无操作</div> :
          log.slice(-10).reverse().map((item, i) => {
            const isMe = me && me.name && item.includes(me.name);
            return (
              <div
                key={i}
                style={{
                  marginBottom: 4,
                  background: isMe ? '#ffe58f' : undefined,
                  color: isMe ? '#d48806' : undefined,
                  fontWeight: isMe ? 700 : undefined,
                  borderRadius: isMe ? 6 : undefined,
                  padding: isMe ? '2px 6px' : undefined
                }}
              >
                {item}
              </div>
            );
          })}
      </div>
    </div>
    );
  }

  return content;
}