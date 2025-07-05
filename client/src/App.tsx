import React from 'react';
import { Button, Layout, Typography } from 'antd';
import 'antd/dist/reset.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529' }}>
        <Title style={{ color: '#fff', margin: 0 }} level={2}>三国杀网页版</Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Button type="primary">创建房间</Button>
        <Button style={{ marginLeft: 16 }}>加入房间</Button>
        {/* 后续补充房间列表、游戏区等 */}
      </Content>
      <Footer style={{ textAlign: 'center' }}>© 2025 三国杀网页版</Footer>
    </Layout>
  );
}

export default App;
