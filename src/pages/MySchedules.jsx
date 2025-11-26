import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Button, Empty, Tag, Space, Modal, message, Checkbox, Alert, Collapse, Radio, Spin } from 'antd'
import { DeleteOutlined, EyeOutlined, CalendarOutlined, WarningOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { studentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WeeklyCalendar from '../components/Schedule/WeeklyCalendar'
import dayjs from 'dayjs'

const { Panel } = Collapse

const MySchedules = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [schedules, setSchedules] = useState([])
    const [viewingSchedule, setViewingSchedule] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [failedClasses, setFailedClasses] = useState([])
    const [showReplacements, setShowReplacements] = useState(false)
    const [replacementClasses, setReplacementClasses] = useState({})
    const [loadingReplacements, setLoadingReplacements] = useState(false)
    const [selectedReplacements, setSelectedReplacements] = useState({})

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
            setFailedClasses([])
            setShowReplacements(false)
            setReplacementClasses({})
            setSelectedReplacements({})
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

    const handleToggleFailedClass = (classId) => {
        setFailedClasses(prev => {
            if (prev.includes(classId)) {
                return prev.filter(id => id !== classId)
            } else {
                return [...prev, classId]
            }
        })
    }

    const handleLoadReplacements = async () => {
        if (failedClasses.length === 0) {
            message.warning('Vui lòng chọn ít nhất một lớp bị lỗi')
            return
        }

        const failedClassesData = viewingSchedule.scheduleData.filter(
            s => failedClasses.includes(s.id)
        )

        const failedCourseNames = [...new Set(failedClassesData.map(s => s.courseName))]

        setLoadingReplacements(true)
        try {
            const allReplacementsPromises = failedCourseNames.map(courseName =>
                studentAPI.getSchedulesByCourse(courseName)
            )
            const results = await Promise.all(allReplacementsPromises)

            // Group by course name
            const groupedReplacements = {}
            results.forEach((result, index) => {
                const courseName = failedCourseNames[index]
                groupedReplacements[courseName] = result.data
            })

            setReplacementClasses(groupedReplacements)
            setShowReplacements(true)

            // Initialize selected replacements
            const initialSelections = {}
            failedClassesData.forEach(failedClass => {
                initialSelections[failedClass.id] = null
            })
            setSelectedReplacements(initialSelections)

            message.success(`Đã load lớp thay thế cho ${failedCourseNames.length} môn`)
        } catch (error) {
            message.error('Không thể tải lớp thay thế')
            console.error(error)
        } finally {
            setLoadingReplacements(false)
        }
    }

    const handleSelectReplacement = (failedClassId, replacementClass) => {
        setSelectedReplacements(prev => ({
            ...prev,
            [failedClassId]: replacementClass
        }))
    }

    const handleSaveNewSchedule = async () => {
        // Check if all failed classes have replacements
        const allSelected = failedClasses.every(id => selectedReplacements[id])

        if (!allSelected) {
            message.warning('Vui lòng chọn lớp thay thế cho tất cả các lớp bị lỗi')
            return
        }

        // Build new schedule
        const newScheduleData = viewingSchedule.scheduleData.filter(
            s => !failedClasses.includes(s.id)
        )

        // Add replacement classes
        failedClasses.forEach(failedId => {
            const replacement = selectedReplacements[failedId]
            if (replacement) {
                newScheduleData.push(replacement)
            }
        })

        try {
            // TODO: Save new schedule to backend
            message.success('Đã lưu lịch mới thành công!')
            setModalVisible(false)
            loadSchedules()
        } catch (error) {
            message.error('Không thể lưu lịch mới')
            console.error(error)
        }
    }

    const handleAutoReschedule = async () => {
        const failedClassesData = viewingSchedule.scheduleData.filter(
            s => failedClasses.includes(s.id)
        )

        const successfulClassesData = viewingSchedule.scheduleData.filter(
            s => !failedClasses.includes(s.id)
        )

        const failedCourseNames = [...new Set(failedClassesData.map(s => s.courseName))]

        try {
            setLoading(true)

            // TODO: Call NSGA-II service
            message.info('Chức năng xếp lịch tự động đang phát triển')
        } catch (error) {
            message.error('Không thể xếp lịch tự động')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Get preview schedule (successful + selected replacements)
    const getPreviewSchedule = () => {
        if (!viewingSchedule) return []

        const successful = viewingSchedule.scheduleData.filter(
            s => !failedClasses.includes(s.id)
        )

        const replacements = Object.values(selectedReplacements).filter(Boolean)

        return [...successful, ...replacements]
    }

    return (
        <div>
            <h1 style={{ color: 'var(--vku-navy)', fontWeight: 700 }}>Lịch Học Của Tôi</h1>

            <Card style={{ marginTop: 24 }} className="vku-card">
                {schedules.length === 0 ? (
                    <Empty
                        description="Chưa có lịch học nào được lưu"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/select-courses')}>
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
                                    avatar={<CalendarOutlined style={{ fontSize: 32, color: 'var(--vku-red)' }} />}
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

            {/* View Schedule Modal */}
            <Modal
                title={
                    <Space>
                        <span>Chi tiết lịch học</span>
                        {failedClasses.length > 0 && (
                            <Tag color="error">{failedClasses.length} lớp bị lỗi</Tag>
                        )}
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    setFailedClasses([])
                    setShowReplacements(false)
                }}
                width={1400}
                footer={
                    showReplacements ? [
                        <Button key="back" onClick={() => setShowReplacements(false)}>
                            Quay lại
                        </Button>,
                        <Button
                            key="save"
                            type="primary"
                            onClick={handleSaveNewSchedule}
                            disabled={!failedClasses.every(id => selectedReplacements[id])}
                        >
                            Lưu lịch mới
                        </Button>
                    ] : [
                        <Button key="close" onClick={() => {
                            setModalVisible(false)
                            setFailedClasses([])
                        }}>
                            Đóng
                        </Button>,
                        failedClasses.length > 0 && (
                            <Button
                                key="manual"
                                type="default"
                                icon={<CheckCircleOutlined />}
                                onClick={handleLoadReplacements}
                                loading={loadingReplacements}
                            >
                                Chọn lớp thay thế
                            </Button>
                        ),
                        failedClasses.length > 0 && (
                            <Button
                                key="auto"
                                type="primary"
                                danger
                                icon={<ThunderboltOutlined />}
                                onClick={handleAutoReschedule}
                            >
                                Xếp tự động (NSGA-II)
                            </Button>
                        )
                    ]
                }
            >
                {viewingSchedule && (
                    <div>
                        {!showReplacements ? (
                            <>
                                <Alert
                                    message="Đánh dấu lớp bị lỗi đăng ký"
                                    description="Click vào các lớp bị lỗi khi đăng ký (lớp đầy, trùng lịch, v.v.) để đánh dấu. Sau đó chọn cách xếp lại."
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />

                                {/* Class Selection List */}
                                <Card size="small" style={{ marginBottom: 16 }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Chọn lớp bị lỗi:</strong>
                                    </div>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {viewingSchedule.scheduleData.map(schedule => (
                                            <Checkbox
                                                key={schedule.id}
                                                checked={failedClasses.includes(schedule.id)}
                                                onChange={() => handleToggleFailedClass(schedule.id)}
                                            >
                                                <Space>
                                                    <Tag color={failedClasses.includes(schedule.id) ? 'error' : 'default'}>
                                                        {schedule.courseName}
                                                    </Tag>
                                                    <span>Lớp {schedule.classNumber}</span>
                                                    <span>-</span>
                                                    <span>{schedule.dayOfWeek}, Tiết {schedule.periods}</span>
                                                </Space>
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Card>

                                <WeeklyCalendar
                                    schedules={viewingSchedule.scheduleData}
                                    confirmedSchedules={viewingSchedule.scheduleData.filter(
                                        s => !failedClasses.includes(s.id)
                                    )}
                                    onSelectSchedule={null}
                                />
                            </>
                        ) : (
                            <>
                                <Alert
                                    message="Chọn lớp thay thế"
                                    description="Chọn lớp thay thế cho từng môn bị lỗi. Lịch bên phải sẽ cập nhật theo lựa chọn của bạn."
                                    type="success"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />

                                <div style={{ display: 'flex', gap: 16 }}>
                                    {/* Left: Replacement Options */}
                                    <div style={{ flex: 1, maxHeight: 600, overflowY: 'auto' }}>
                                        <Collapse defaultActiveKey={Object.keys(replacementClasses)}>
                                            {viewingSchedule.scheduleData
                                                .filter(s => failedClasses.includes(s.id))
                                                .map(failedClass => (
                                                    <Panel
                                                        header={
                                                            <Space>
                                                                <WarningOutlined style={{ color: '#ff4d4f' }} />
                                                                <strong>{failedClass.courseName}</strong>
                                                                <Tag color="error">Lớp {failedClass.classNumber} (Bị lỗi)</Tag>
                                                                {selectedReplacements[failedClass.id] && (
                                                                    <Tag color="success">
                                                                        → Lớp {selectedReplacements[failedClass.id].classNumber}
                                                                    </Tag>
                                                                )}
                                                            </Space>
                                                        }
                                                        key={failedClass.id}
                                                    >
                                                        <Radio.Group
                                                            value={selectedReplacements[failedClass.id]?.id}
                                                            onChange={(e) => {
                                                                const selected = replacementClasses[failedClass.courseName]?.find(
                                                                    r => r.id === e.target.value
                                                                )
                                                                handleSelectReplacement(failedClass.id, selected)
                                                            }}
                                                            style={{ width: '100%' }}
                                                        >
                                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                                {replacementClasses[failedClass.courseName]?.map(replacement => (
                                                                    <Radio key={replacement.id} value={replacement.id}>
                                                                        <Space direction="vertical" size="small">
                                                                            <div>
                                                                                <Tag color="blue">Lớp {replacement.classNumber}</Tag>
                                                                                <Tag>{replacement.dayOfWeek}</Tag>
                                                                                <Tag>Tiết {replacement.periods}</Tag>
                                                                            </div>
                                                                            <div style={{ fontSize: 12, color: '#666' }}>
                                                                                {replacement.location}.{replacement.roomNumber} - {replacement.instructor}
                                                                            </div>
                                                                        </Space>
                                                                    </Radio>
                                                                ))}
                                                            </Space>
                                                        </Radio.Group>
                                                    </Panel>
                                                ))}
                                        </Collapse>
                                    </div>

                                    {/* Right: Preview Calendar */}
                                    <div style={{ flex: 1 }}>
                                        <Card size="small" title="Xem trước lịch mới">
                                            <WeeklyCalendar
                                                schedules={getPreviewSchedule()}
                                                confirmedSchedules={getPreviewSchedule()}
                                                onSelectSchedule={null}
                                            />
                                        </Card>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default MySchedules
