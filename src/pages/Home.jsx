import { Card, Row, Col, Button, Typography, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
    BookOutlined,
    CalendarOutlined,
    RocketOutlined,
    SaveOutlined
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const Home = () => {
    const navigate = useNavigate()

    const features = [
        {
            icon: <BookOutlined style={{ fontSize: 48, color: 'var(--vku-red)' }} />,
            title: 'Chọn môn học',
            description: 'Chọn các môn học bạn muốn đăng ký trong học kỳ',
            action: () => navigate('/select-courses'),
            buttonText: 'Bắt đầu',
            gradient: 'linear-gradient(135deg, var(--vku-red-50) 0%, var(--vku-red-100) 100%)'
        },
        {
            icon: <CalendarOutlined style={{ fontSize: 48, color: 'var(--vku-yellow-800)' }} />,
            title: 'Xếp lịch thủ công',
            description: 'Tự tay chọn lớp và xếp lịch theo ý muốn',
            action: () => navigate('/manual-schedule'),
            buttonText: 'Xếp lịch',
            gradient: 'linear-gradient(135deg, var(--vku-yellow-50) 0%, var(--vku-yellow-100) 100%)'
        },
        {
            icon: <RocketOutlined style={{ fontSize: 48, color: 'var(--vku-navy)' }} />,
            title: 'Xếp lịch tự động',
            description: 'Sử dụng thuật toán NSGA-II để tối ưu hóa lịch học',
            action: () => navigate('/select-courses'),
            buttonText: 'Tối ưu',
            gradient: 'linear-gradient(135deg, var(--vku-navy-50) 0%, var(--vku-navy-100) 100%)'
        },
        {
            icon: <SaveOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
            title: 'Lịch đã lưu',
            description: 'Xem và quản lý các lịch học đã lưu',
            action: () => navigate('/my-schedules'),
            buttonText: 'Xem lịch',
            gradient: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
        }
    ]

    return (
        <div>
            <div style={{
                textAlign: 'center',
                marginBottom: 48,
                padding: '40px 20px',
                background: 'linear-gradient(135deg, var(--vku-red) 0%, var(--vku-navy) 100%)',
                borderRadius: 'var(--radius-lg)',
                color: 'white',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <Title level={1} style={{ color: 'white', marginBottom: 16, fontWeight: 700 }}>
                    Chào mừng đến với VKU Schedule
                </Title>
                <Paragraph style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                    Hệ thống xếp lịch học thông minh giúp bạn tối ưu hóa thời gian học tập
                </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
                {features.map((feature, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            hoverable
                            className="vku-card fade-in"
                            style={{
                                height: '100%',
                                textAlign: 'center',
                                background: feature.gradient,
                                border: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            bodyStyle={{ padding: '32px 24px' }}
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div className="pulse">
                                    {feature.icon}
                                </div>
                                <Title level={4} style={{ margin: 0, color: 'var(--text-dark)' }}>
                                    {feature.title}
                                </Title>
                                <Paragraph type="secondary" style={{ minHeight: 60 }}>
                                    {feature.description}
                                </Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={feature.action}
                                    block
                                    style={{
                                        height: 48,
                                        fontWeight: 600,
                                        fontSize: 16
                                    }}
                                >
                                    {feature.buttonText}
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card
                style={{ marginTop: 48 }}
                className="vku-card"
                bodyStyle={{ padding: '32px' }}
            >
                <div className="vku-card-header">
                    <BookOutlined style={{ fontSize: 24, color: 'var(--vku-red)' }} />
                    <h2 className="vku-card-title">Hướng dẫn sử dụng</h2>
                </div>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{
                        padding: 16,
                        background: 'var(--vku-red-50)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '4px solid var(--vku-red)'
                    }}>
                        <strong style={{ color: 'var(--vku-red)' }}>1. Chọn môn học:</strong>
                        <p style={{ margin: '8px 0 0 0' }}>
                            Chọn các môn bạn muốn đăng ký thông qua menu dropdown hoặc tìm kiếm
                        </p>
                    </div>

                    <div style={{
                        padding: 16,
                        background: 'var(--vku-yellow-50)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '4px solid var(--vku-yellow-700)'
                    }}>
                        <strong style={{ color: 'var(--vku-yellow-800)' }}>2. Xếp lịch:</strong>
                        <p style={{ margin: '8px 0 0 0' }}>
                            Chọn xếp thủ công để tự chọn lớp, hoặc để thuật toán NSGA-II tự động tối ưu hóa
                        </p>
                    </div>

                    <div style={{
                        padding: 16,
                        background: 'var(--vku-navy-50)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '4px solid var(--vku-navy)'
                    }}>
                        <strong style={{ color: 'var(--vku-navy)' }}>3. Lưu lịch:</strong>
                        <p style={{ margin: '8px 0 0 0' }}>
                            Lưu lại các lịch học đã xếp để so sánh và sử dụng sau
                        </p>
                    </div>

                    <div style={{
                        padding: 16,
                        background: '#f6ffed',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '4px solid #52c41a'
                    }}>
                        <strong style={{ color: '#52c41a' }}>4. Đăng ký:</strong>
                        <p style={{ margin: '8px 0 0 0' }}>
                            Sử dụng lịch đã lưu để đăng ký môn học trên hệ thống
                        </p>
                    </div>
                </Space>
            </Card>
        </div>
    )
}

export default Home
