import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import {
    HomeOutlined,
    BookOutlined,
    CalendarOutlined,
    SaveOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'

const { Header, Sider, Content } = Layout

const StudentLayout = () => {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const menuItems = [
        {
            key: '/home',
            icon: <HomeOutlined />,
            label: 'Trang chủ'
        },
        {
            key: '/select-courses',
            icon: <BookOutlined />,
            label: 'Chọn môn học'
        },
        {
            key: '/manual-schedule',
            icon: <CalendarOutlined />,
            label: 'Xếp lịch thủ công'
        },
        {
            key: '/my-schedules',
            icon: <SaveOutlined />,
            label: 'Lịch của tôi'
        }
    ]

    const handleMenuClick = ({ key }) => {
        navigate(key)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân'
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout
        }
    ]

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                style={{
                    background: 'var(--vku-navy)'
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--vku-red) 0%, var(--vku-navy) 100%)',
                    color: 'white',
                    fontSize: collapsed ? 16 : 20,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    {collapsed ? 'VKU' : 'VKU Schedule'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        background: 'var(--vku-navy)',
                        borderRight: 0
                    }}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: 'linear-gradient(135deg, var(--vku-navy) 0%, var(--vku-navy-700) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 20
                    }}>
                        Hệ Thống Xếp Lịch Học VKU
                    </h2>

                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar
                                src={user?.picture}
                                icon={<UserOutlined />}
                                style={{
                                    background: 'var(--vku-yellow)',
                                    color: 'var(--text-dark)'
                                }}
                            />
                            <span style={{ color: 'white', fontWeight: 500 }}>
                                {user?.name}
                            </span>
                        </Space>
                    </Dropdown>
                </Header>
                <Content style={{
                    margin: '24px 16px',
                    padding: 24,
                    background: 'var(--bg-grey)',
                    minHeight: 280
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default StudentLayout
