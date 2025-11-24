import { useState, useEffect } from 'react'
import { Card, List, Button, Empty, Tag, Space, Modal, message } from 'antd'
import { DeleteOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons'
import { studentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WeeklyCalendar from '../components/Schedule/WeeklyCalendar'
import dayjs from 'dayjs'

const MySchedules = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [schedules, setSchedules] = useState([])
    const [viewingSchedule, setViewingSchedule] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        if (user) {
            loadSchedules()
        }
    }, [user])

    const loadSchedules = async () => {
        setLoading(true)
        try {
            const response = await studentAPI.getMySchedules(user.id)
            setSchedules(response.data)
        } catch (error) {
            message.error('Không thể tải lịch học')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewSchedule = (schedule) => {
        try {
            const parsedSchedule = JSON.parse(schedule.schedule)
            setViewingSchedule({
                ...schedule,
                scheduleData: parsedSchedule
            })
            setModalVisible(true)
        } catch (error) {
            message.error('Không thể hiển thị lịch học')
            console.error(error)
        }
    }

    const handleDeleteSchedule = async (scheduleId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa lịch học này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await studentAPI.deleteSchedule(scheduleId)
                    message.success('Đã xóa lịch học')
                    loadSchedules()
                } catch (error) {
                    message.error('Không thể xóa lịch học')
                    console.error(error)
                }
            }
        })
    }

    return (
        <div>
            <h1>Lịch Học Của Tôi</h1>

            <Card style={{ marginTop: 24 }}>
                {schedules.length === 0 ? (
                    <Empty
                        description="Chưa có lịch học nào được lưu"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => window.location.href = '/select-courses'}>
                            Bắt đầu xếp lịch
                        </Button>
                    </Empty>
                ) : (
                    <List
                        loading={loading}
                        dataSource={schedules}
                        renderItem={(schedule) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewSchedule(schedule)}
                                    >
                                        Xem
                                    </Button>,
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                    >
                                        Xóa
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<CalendarOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                                    title={
                                        <Space>
                                            <span>Lịch học {schedule.semester?.semesterName}</span>
                                            <Tag color="blue">
                                                {schedule.semester?.academicYear?.yearName}
                                            </Tag>
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" size="small">
                                            <div>
                                                Ngày tạo: {dayjs(schedule.createdAt).format('DD/MM/YYYY HH:mm')}
                                            </div>
                                            {schedule.parsedPrompt && (
                                                <div>
                                                    <Tag color="purple">Tự động</Tag>
                                                    Prompt: {schedule.parsedPrompt}
                                                </div>
                                            )}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            <Modal
                title="Chi tiết lịch học"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                width={1200}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
            >
                {viewingSchedule && (
                    <div>
                        {viewingSchedule.parsedPrompt && (
                            <Card size="small" style={{ marginBottom: 16 }}>
                                <strong>Prompt đã parse:</strong> {viewingSchedule.parsedPrompt}
                            </Card>
                        )}
                        <WeeklyCalendar
                            schedules={viewingSchedule.scheduleData}
                            selectedSchedules={viewingSchedule.scheduleData}
                            onSelectSchedule={() => { }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default MySchedules
