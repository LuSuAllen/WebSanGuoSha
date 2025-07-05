import React from 'react';
import { Card, Avatar, Tag, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const seatColors = ['#fadb14', '#b7eb8f', '#91d5ff', '#ff85c0', '#ffd666', '#ff7875', '#d3adf7', '#95de64'];
const identities = ['主公', '忠臣', '反贼', '内奸'];
const identityColors = ['red', 'green', 'blue', 'purple'];

// mock 玩家
const mockPlayers = [
  { name: '玩家1', identity: '主公', hp: 4, avatar: '', hand: 4 },
  { name: '玩家2', identity: '忠臣', hp: 4, avatar: '', hand: 4 },
  { name: '玩家3', identity: '反贼', hp: 4, avatar: '', hand: 4 },
  { name: '玩家4', identity: '内奸', hp: 4, avatar: '', hand: 4 },
];

export default function GameTable({ onExit }: { onExit: () => void }) {
  // 圆桌布局
  const seatCount = mockPlayers.length;
  const radius = 180;
  const center = 220;

  return (
    <div style={{ minHeight: 500, background: 'url(https://img.zcool.cn/community/01b1e95b6e2e6fa8012193a3e2e2e2.jpg) center/cover', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32, position: 'relative', maxWidth: 600, margin: '32px auto' }}>
      <Button onClick={onExit} style={{ position: 'absolute', right: 24, top: 24, zIndex: 2 }}>退出游戏</Button>
      <div style={{ position: 'relative', width: 440, height: 440, margin: '0 auto' }}>
        {/* 玩家座位 */}
        {mockPlayers.map((p, idx) => {
          const angle = (2 * Math.PI / seatCount) * idx - Math.PI / 2;
          const x = center + radius * Math.cos(angle) - 48;
          const y = center + radius * Math.sin(angle) - 48;
          return (
            <Card
              key={p.name}
              style={{ position: 'absolute', left: x, top: y, width: 96, height: 120, textAlign: 'center', background: '#fffbe6', border: '2px solid #d4b106', borderRadius: 12, boxShadow: '0 2px 8px #0002' }}
              bodyStyle={{ padding: 8 }}
            >
              <Avatar size={48} icon={<UserOutlined />} style={{ background: seatColors[idx % seatColors.length], marginBottom: 4 }} />
              <div style={{ fontWeight: 700, fontFamily: 'STKaiti', fontSize: 16 }}>{p.name}</div>
              <Tag color={identityColors[identities.indexOf(p.identity)]} style={{ fontFamily: 'STKaiti', marginTop: 4 }}>{p.identity}</Tag>
              <div style={{ marginTop: 4 }}>♥️{p.hp} 手牌:{p.hand}</div>
            </Card>
          );
        })}
        {/* 桌面中央区域 */}
        <div style={{ position: 'absolute', left: center - 60, top: center - 60, width: 120, height: 120, background: 'rgba(255,255,255,0.85)', borderRadius: '50%', border: '3px solid #d4b106', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'STKaiti', fontSize: 28, color: '#ad6800', fontWeight: 700, boxShadow: '0 2px 8px #0002' }}>
          三国杀
        </div>
      </div>
      {/* 手牌区 */}
      <div style={{ margin: '32px auto 0', textAlign: 'center' }}>
        <Card style={{ display: 'inline-block', background: '#fffbe6', border: '2px solid #d4b106', borderRadius: 12, minWidth: 320 }}>
          <div style={{ fontFamily: 'STKaiti', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>你的手牌</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {/* 示例手牌 */}
            <Card style={{ width: 60, height: 90, background: '#fff', border: '1px solid #b37feb', borderRadius: 8, fontFamily: 'STKaiti', fontSize: 16, textAlign: 'center', lineHeight: '90px', color: '#531dab' }}>杀</Card>
            <Card style={{ width: 60, height: 90, background: '#fff', border: '1px solid #b37feb', borderRadius: 8, fontFamily: 'STKaiti', fontSize: 16, textAlign: 'center', lineHeight: '90px', color: '#531dab' }}>闪</Card>
            <Card style={{ width: 60, height: 90, background: '#fff', border: '1px solid #b37feb', borderRadius: 8, fontFamily: 'STKaiti', fontSize: 16, textAlign: 'center', lineHeight: '90px', color: '#531dab' }}>桃</Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
