import { useState, useEffect } from 'react'
import { Card, Select, Spin, Empty, Button, Space, Tag, Modal, message, List } from 'antd'
import { DeleteOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons'
import { studentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WeeklyCalendar from '../components/Schedule/WeeklyCalendar'
import { formatCourseName } from '../utils/courseUtils'

const MySchedules = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [academicYears, setAcademicYears] = useState([])
    const [semesters, setSemesters] = useState([])
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null)
    const [selectedSemester, setSelectedSemester] = useState(null)
    const [mySchedules, setMySchedules] = useState([])
    const [viewingSchedule, setViewingSchedule] = useState(null)
    const [viewModalVisible, setViewModalVisible] = useState(false)

    useEffect(() => {
        loadAcademicYears()
    }, [])

    useEffect(() => {
        if (selectedSemester && user) {
            loadMySchedules()
        }
    }, [selectedSemester, user])

    const loadAcademicYears = async () => {
        setLoading(true)
        try {
            const response = await studentAPI.getAcademicYears()
            setAcademicYears(response.data)
        } catch (error) {
            message.error('Không thể tải danh sách năm học')
        } finally {
            setLoading(false)
        }
    }

    const handleAcademicYearChange = async (value) => {
        setSelectedAcademicYear(value)
        setSelectedSemester(null)
        setSemesters([])
        setMySchedules([])

        if (!value) return

        setLoading(true)
        try {
            const response = await studentAPI.getSemesters(value)
            setSemesters(response.data)
        } catch (error) {
            message.error('Không thể tải danh sách học kỳ')
        } finally {
            setLoading(false)
        }
    }

    const loadMySchedules = async () => {
        if (!user || !user.id) {
            message.error('Không tìm thấy thông tin người dùng')
            return
        }

        setLoading(true)
        try {
            const response = await studentAPI.getMySchedules(user.id, selectedSemester)
            setMySchedules(response.data)
        } catch (error) {
            message.error('Không thể tải lịch học')
        } finally {
            setLoading(false)
        }
    }

    const handleViewSchedule = (schedule) => {
        try {
            const scheduleData = JSON.parse(schedule.schedule)
            setViewingSchedule({
                ...schedule,
                scheduleData
            })
            setViewModalVisible(true)
        } catch (error) {
            message.error('Không thể hiển thị lịch học')
        }
    }

    const handleDeleteSchedule = (scheduleId) => {
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
                    loadMySchedules()
                } catch (error) {
                    message.error('Không thể xóa lịch học')
                }
            }
        })
    }

    return (
        <div>
            <h1 style={{ color: 'var(--vku-navy)', fontWeight: 700 }}>Lịch Học Của Tôi</h1>

            <Card style={{ marginTop: 24 }} className="vku-card">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            Năm học
                        </label>
                        <Select
                            placeholder="Chọn năm học"
                            style={{ width: '100%' }}
                            value={selectedAcademicYear}
                            onChange={handleAcademicYearChange}
                            allowClear
                            options={academicYears.map(y => ({
                                label: y.yearName,
                                value: y.id
                            }))}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            Học kỳ
                        </label>
                        <Select
                            placeholder="Chọn học kỳ"
                            style={{ width: '100%' }}
                            value={selectedSemester}
                            onChange={setSelectedSemester}
                            disabled={!selectedAcademicYear}
                            allowClear
                            options={semesters.map(s => ({
                                label: s.semesterName,
                                value: s.id
                            }))}
                        />
                    </div>
                </Space>
            </Card>

            {selectedSemester && (
                <Card
                    title={
                        <Space>
                            <CalendarOutlined style={{ fontSize: 20, color: 'var(--vku-red)' }} />
                            <span>Lịch đã lưu</span>
                            <Tag color="blue">{mySchedules.length}</Tag>
                        </Space>
                    }
                    style={{ marginTop: 24 }}
                    className="vku-card"
                >
                    <Spin spinning={loading}>
                        {mySchedules.length === 0 ? (
                            <Empty
                                description="Chưa có lịch học nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ) : (
                            <List
                                dataSource={mySchedules}
                                renderItem={(schedule) => {
                                    const scheduleData = JSON.parse(schedule.schedule)
                                    return (
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
                                                title={
                                                    <Space>
                                                        <CalendarOutlined style={{ color: 'var(--vku-red)' }} />
                                                        <span>
                                                            {schedule.semesterName} - {schedule.academicYear}
                                                        </span>
                                                    </Space>
                                                }
                                                description={
                                                    <Space direction="vertical" size="small">
                                                        <div>
                                                            <Tag color="green">{scheduleData.length} lớp học</Tag>
                                                            <span style={{ color: '#666', fontSize: 13 }}>
                                                                Lưu lúc: {new Date(schedule.createdAt).toLocaleString('vi-VN')}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: 13 }}>
                                                            {scheduleData.slice(0, 3).map((s, i) => (
                                                                <span key={i}>
                                                                    {formatCourseName(s.courseName, s.subtopic)}
                                                                    {i < Math.min(2, scheduleData.length - 1) && ', '}
                                                                </span>
                                                            ))}
                                                            {scheduleData.length > 3 && '...'}
                                                        </div>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )
                                }}
                            />
                        )}
                    </Spin>
                </Card>
            )}

            {/* View Schedule Modal */}
            <Modal
                title={
                    viewingSchedule && (
                        <Space>
                            <CalendarOutlined />
                            <span>
                                {viewingSchedule.semesterName} - {viewingSchedule.academicYear}
                            </span>
                        </Space>
                    )
                }
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={1200}
            >
                {viewingSchedule && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <Tag color="green">{viewingSchedule.scheduleData.length} lớp học</Tag>
                            <span style={{ color: '#666', fontSize: 13 }}>
                                Lưu lúc: {new Date(viewingSchedule.createdAt).toLocaleString('vi-VN')}
                            </span>
                        </div>

                        <WeeklyCalendar
                            schedules={viewingSchedule.scheduleData}
                            confirmedSchedules={viewingSchedule.scheduleData}
                            currentCourse={null}
                            onSelectSchedule={null}
                        />

                        <div style={{ marginTop: 16 }}>
                            <h4>Danh sách lớp:</h4>
                            <List
                                size="small"
                                dataSource={viewingSchedule.scheduleData}
                                renderItem={(schedule) => (
                                    <List.Item>
                                        <Space>
                                            <span style={{ fontWeight: 500 }}>
                                                {formatCourseName(schedule.courseName, schedule.subtopic)}
                                            </span>
                                            {schedule.classNumber && (
                                                <Tag color="blue">Lớp {schedule.classNumber}</Tag>
                                            )}
                                            <Tag>{schedule.dayOfWeek}</Tag>
                                            <Tag>Tiết {schedule.periods}</Tag>
                                            <Tag>{schedule.location}.{schedule.roomNumber}</Tag>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default MySchedules
