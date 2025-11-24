import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Space, message, Button } from 'antd'
import { GoogleLogin } from '@react-oauth/google'
import { LoginOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const Login = () => {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    }, [isAuthenticated, navigate])

    const handleSuccess = async (credentialResponse) => {
        try {
            await login(credentialResponse.credential)
            message.success('Đăng nhập thành công!')
            navigate('/home')
        } catch (error) {
            message.error(error.message || 'Đăng nhập thất bại')
        }
    }

    const handleError = () => {
        message.error('Đăng nhập thất bại. Vui lòng thử lại.')
    }

    const handleMockLogin = async () => {
        try {
            await login('mock-credential')
            message.success('Đăng nhập thành công (Mock Mode)!')
            navigate('/home')
        } catch (error) {
            message.error(error.message || 'Đăng nhập thất bại')
        }
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <Card style={{ width: 400, textAlign: 'center' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ marginBottom: 8 }}>
                            VKU Schedule
                        </Title>
                        <Text type="secondary">
                            Hệ thống xếp lịch học thông minh
                        </Text>
                    </div>

                    <div>
                        <Text>Đăng nhập bằng tài khoản VKU</Text>
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                            {USE_MOCK ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<LoginOutlined />}
                                    onClick={handleMockLogin}
                                    block
                                >
                                    Đăng nhập (Mock Mode)
                                </Button>
                            ) : (
                                <GoogleLogin
                                    onSuccess={handleSuccess}
                                    onError={handleError}
                                    useOneTap
                                    text="signin_with"
                                    shape="rectangular"
                                    size="large"
                                />
                            )}
                        </div>
                    </div>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Chỉ chấp nhận email có đuôi @vku.udn.vn
                    </Text>
                </Space>
            </Card>
        </div>
    )
}

export default Login
