import React, { useEffect, useState } from 'react';
import { Button, Card, List, Typography, message, Avatar, Tag } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';

import { API_BASE } from './config.ts';
import GameTable from './GameTable.tsx';

const { Title } = Typography;

interface Player {
  playerId: string;
  name: string;
  ready?: boolean;
  isOwner?: boolean;
}


interface Room {
  id: string;
  name: string;
  players: Player[];
  started?: boolean;
}

type RoomLobbyProps = {
  roomId: string;
  onExit: () => void;
};

export default function RoomLobby({ roomId, onExit }: RoomLobbyProps) {
// 仅保留函数内部声明，无需在文件顶层声明这些变量

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  // 移除本地ready状态，只依赖后端room.players
  const [inGame, setInGame] = useState(false);
  // 获取本地玩家身份
  const playerId = localStorage.getItem('sgs_player_id') || '';
  const playerName = localStorage.getItem('sgs_player_name') || '';

  // 获取房间信息
  const fetchRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      const data: Room[] = await res.json();
      const found = data.find(r => r.id === roomId);
      setRoom(found || null);
      // 如果自己已不在房间，自动退出
      if (found && !found.players.some(p => p.playerId === playerId)) {
        message.info('你已被移出房间');
        onExit();
      }
      // 如果房间已被解散
      if (!found) {
        message.info('房间已解散');
        onExit();
      }
    } catch {
      message.error('获取房间信息失败');
    } finally {
      setLoading(false);
    }
  };

   console.log('room?.started', room?.started);

  useEffect(() => {
    fetchRoom();
    const timer = setInterval(fetchRoom, 2000); // 轮询刷新
    return () => clearInterval(timer);
  }, [roomId]);

  // 监听房间 started 字段，自动进入/退出游戏
  useEffect(() => {
    if (room?.started && !inGame) {
      setInGame(true);
    } else if (!room?.started && inGame) {
      setInGame(false);
    }
  }, [room?.started, inGame]);

  // 已移除本地ready状态同步逻辑

  // 准备/取消准备（同步到后端）
  const handleReady = async () => {
    try {
      // 只依赖room.players里的ready
      const me = room?.players.find(p => p.playerId === playerId);
      const nextReady = !me?.ready;
      await fetch(`${API_BASE}/api/rooms/${roomId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, ready: nextReady })
      });
      message.success(nextReady ? '已准备' : '已取消准备');
      fetchRoom();
    } catch {
      message.error('操作失败');
    }
  };

  // 退出房间
  const handleExit = async () => {
    if (!roomId || !playerId) {
      onExit();
      return;
    }
    try {
      await fetch(`${API_BASE}/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
    } catch {}
    onExit();
  };

  // 游戏桌面退出时，自动重置 started=false 并回到房间大厅
  const handleGameExit = async () => {
    try {
      await fetch(`${API_BASE}/api/rooms/${roomId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, start: false })
      });
    } catch {}
    setInGame(false);
  };

  if (inGame) {
    return <GameTable onExit={handleGameExit} roomId={roomId} />;
  }

  return (
    <Card
      style={{ maxWidth: 600, margin: '32px auto', background: '#f9f6f2', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}
      title={<span style={{ fontFamily: 'STKaiti', fontSize: 22 }}>🏯 房间：{room?.name || ''} <Tag color="gold">ID: {roomId}</Tag></span>}
      extra={<Button onClick={handleExit}>退出房间</Button>}
    >
      <Title level={4} style={{ fontFamily: 'STKaiti', color: '#7c4d00' }}>玩家列表</Title>
      <List
        loading={loading}
        dataSource={room?.players || []}
        renderItem={(player, idx) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={player.isOwner ? <CrownOutlined /> : <UserOutlined />} style={{ background: player.isOwner ? '#fadb14' : '#b37feb' }} />}
              title={
                <span style={{ fontWeight: player.isOwner ? 700 : 400 }}>
                  {player.name} {player.isOwner && <Tag color="gold">房主</Tag>} {Boolean(player.ready) && <Tag color="green">已准备</Tag>}
                  {/* 房主可踢人，不能踢自己 */}
                  {room?.players?.[0]?.playerId === playerId && player.playerId !== playerId && (
                    <Button size="small" danger style={{ marginLeft: 8 }} onClick={async () => {
                      await fetch(`${API_BASE}/api/rooms/${roomId}/kick`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerId, targetPlayerId: player.playerId })
                      });
                      message.success(`已将${player.name}踢出房间`);
                      fetchRoom();
                    }}>踢出</Button>
                  )}
                </span>
              }
            />
          </List.Item>
        )}
      />
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button type="primary" size="large" style={{ width: 120, fontFamily: 'STKaiti' }} onClick={handleReady}>
          {Boolean(room?.players.find(p => p.playerId === playerId)?.ready) ? '取消准备' : '准备'}
        </Button>
        {room?.players?.[0]?.playerId === playerId && (
          <>
            <Button
              type="dashed"
              size="large"
              style={{ marginLeft: 16, width: 120, fontFamily: 'STKaiti' }}
              onClick={async () => {
                // 只有房主点击才发送开始游戏请求
                await fetch(`${API_BASE}/api/rooms/${roomId}/ready`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ playerId, start: true })
                });
              }}
              disabled={!(room?.players.length > 0 && room.players.every(p => p.ready))}
            >
              {room?.players.length > 0 && room.players.every(p => p.ready) ? '开始游戏' : '等待所有玩家准备'}
            </Button>
            <Button
              danger
              style={{ marginLeft: 16, fontFamily: 'STKaiti' }}
              onClick={async () => {
                await fetch(`${API_BASE}/api/rooms/${roomId}/dismiss`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ playerId })
                });
                message.success('房间已解散');
                onExit();
              }}
            >解散房间</Button>
          </>
        )}
      </div>
    </Card>
  );
}
