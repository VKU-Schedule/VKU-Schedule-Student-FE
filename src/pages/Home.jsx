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
            icon: <BookOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
            title: 'Chọn môn học',
            description: 'Chọn các môn học bạn muốn đăng ký trong học kỳ',
            action: () => navigate('/select-courses'),
            buttonText: 'Bắt đầu'
        },
        {
            icon: <CalendarOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
            title: 'Xếp lịch thủ công',
            description: 'Tự tay chọn lớp và xếp lịch theo ý muốn',
            action: () => navigate('/manual-schedule'),
            buttonText: 'Xếp lịch'
        },
        {
            icon: <RocketOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
            title: 'Xếp lịch tự động',
            description: 'Sử dụng AI để tối ưu hóa lịch học của bạn',
            action: () => navigate('/select-courses'),
            buttonText: 'Tối ưu'
        },
        {
            icon: <SaveOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
            title: 'Lịch đã lưu',
            description: 'Xem và quản lý các lịch học đã lưu',
            action: () => navigate('/my-schedules'),
            buttonText: 'Xem lịch'
        }
    ]

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Title level={2}>Chào mừng đến với VKU Schedule</Title>
                <Paragraph type="secondary">
                    Hệ thống xếp lịch học thông minh giúp bạn tối ưu hóa thời gian học tập
                </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
                {features.map((feature, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            hoverable
                            style={{ height: '100%', textAlign: 'center' }}
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                {feature.icon}
                                <Title level={4}>{feature.title}</Title>
                                <Paragraph type="secondary">
                                    {feature.description}
                                </Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={feature.action}
                                    block
                                >
                                    {feature.buttonText}
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card style={{ marginTop: 48 }}>
                <Title level={4}>Hướng dẫn sử dụng</Title>
                <ol>
                    <li>
                        <strong>Chọn môn học:</strong> Chọn các môn bạn muốn đăng ký thông qua menu dropdown hoặc tìm kiếm
                    </li>
                    <li>
                        <strong>Xếp lịch:</strong> Chọn xếp thủ công hoặc để AI tự động tối ưu hóa
                    </li>
                    <li>
                        <strong>Lưu lịch:</strong> Lưu lại các lịch học đã xếp để sử dụng sau
                    </li>
                    <li>
                        <strong>Đăng ký:</strong> Sử dụng lịch đã lưu để đăng ký môn học trên hệ thống
                    </li>
                </ol>
            </Card>
        </div>
    )
}

export default Home
