
import React, { useState, useEffect } from 'react';
import { Button, Layout, Typography, Modal, Input, message, List, Card, Spin } from 'antd';
import RoomLobby from './RoomLobby.tsx';
import { API_BASE } from './config.ts';
import 'antd/dist/reset.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;




interface Player {
  playerId: string;
  name: string;
  ready?: boolean;
}
interface Room {
  id: string;
  name: string;
  players: Player[];
}

function App() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [inRoomId, setInRoomId] = useState<string | null>(null);
  // 玩家唯一身份
  const [playerId] = useState(() => {
    let id = localStorage.getItem('sgs_player_id');
    if (!id) {
      id = 'p' + Math.random().toString(36).slice(2) + Date.now();
      localStorage.setItem('sgs_player_id', id);
    }
    return id;
  });
  const [playerName, setPlayerName] = useState(() => {
    let name = localStorage.getItem('sgs_player_name');
    if (!name) {
      name = '玩家' + Math.floor(Math.random() * 10000);
      localStorage.setItem('sgs_player_name', name);
    }
    return name;
  });

  // 获取房间列表
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (e) {
      message.error('获取房间列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 创建房间逻辑
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      message.error('请输入房间名');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName })
      });
      if (!res.ok) throw new Error('创建失败');
      const data = await res.json();
      // 创建后自动加入房间
      await handleJoinRoom(data.id);
      setCreateModalOpen(false);
      setRoomName('');
      fetchRooms();
    } catch (e) {
      message.error('创建房间失败');
    }
  };

  // 加入房间逻辑
  const handleJoinRoom = async (roomIdParam?: string) => {
    const targetRoomId = roomIdParam || joinRoomId;
    if (!targetRoomId.trim()) {
      message.error('请输入房间号');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${targetRoomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, name: playerName })
      });
      if (!res.ok) throw new Error('加入失败');
      const data = await res.json();
      message.success(`已加入房间“${data.name}”`);
      setJoinModalOpen(false);
      setJoinRoomId('');
      setInRoomId(data.id); // 进入房间大厅
      fetchRooms();
    } catch (e) {
      message.error('加入房间失败，房间号可能不存在');
    }
  };

  // 事件专用包装
  const handleJoinRoomEvent = (e: any) => {
    e?.preventDefault?.();
    handleJoinRoom();
  };

  // 退出房间时，先退出再刷新房间列表
  const handleExitRoom = () => {
    setInRoomId(null);
    fetchRooms();
  };

  if (inRoomId) {
    return <RoomLobby roomId={inRoomId} onExit={handleExitRoom} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529' }}>
        <Title style={{ color: '#fff', margin: 0 }} level={2}>三国杀网页版</Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>创建房间</Button>
        <Button style={{ marginLeft: 16 }} onClick={() => setJoinModalOpen(true)}>加入房间</Button>

        {/* 房间列表 */}
        <Card style={{ marginTop: 32 }} title="房间列表">
          {loading ? <Spin /> : (
            <List
              dataSource={rooms}
              locale={{ emptyText: '暂无房间' }}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small" onClick={() => handleJoinRoom(item.id)} key="join">加入</Button>
                  ]}
                >
                  <div>
                    <b>房间号：</b>{item.id} &nbsp; <b>房间名：</b>{item.name} &nbsp; <b>人数：</b>{item.players.length}
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* 创建房间弹窗 */}
        <Modal
          title="创建房间"
          open={createModalOpen}
          onOk={handleCreateRoom}
          onCancel={() => setCreateModalOpen(false)}
          okText="创建"
          cancelText="取消"
        >
          <Input
            placeholder="请输入房间名"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            onPressEnter={handleCreateRoom}
          />
        </Modal>

        {/* 加入房间弹窗 */}
        <Modal
          title="加入房间"
          open={joinModalOpen}
          onOk={handleJoinRoomEvent}
          onCancel={() => setJoinModalOpen(false)}
          okText="加入"
          cancelText="取消"
        >
          <Input
            placeholder="请输入房间号"
            value={joinRoomId}
            onChange={e => setJoinRoomId(e.target.value)}
            onPressEnter={handleJoinRoomEvent}
          />
        </Modal>
      </Content>
      <Footer style={{ textAlign: 'center' }}>© 2025 三国杀网页版</Footer>
    </Layout>
  );
}

export default App;
