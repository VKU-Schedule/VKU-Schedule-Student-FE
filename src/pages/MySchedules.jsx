import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Button, Empty, Tag, Space, Modal, message, Checkbox, Alert, Collapse, Radio } from 'antd'
import { DeleteOutlined, EyeOutlined, CalendarOutlined, WarningOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { studentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WeeklyCalendar from '../components/Schedule/WeeklyCalendar'
import MyScheduleCalendar from '../components/Schedule/MyScheduleCalendar'
import dayjs from 'dayjs'

const { Panel } = Collapse

const MySchedules = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [schedules, setSchedules] = useState([])
    const [selectedSchedule, setSelectedSchedule] = useState(null)
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
            console.log('Loading schedules for user:', user.id)
            const response = await studentAPI.getMySchedules(user.id, null)
            console.log('Schedules loaded:', response.data)
            setSchedules(response.data)
            // Auto-select first schedule
            if (response.data.length > 0 && !selectedSchedule) {
                handleSelectSchedule(response.data[0])
            }
        } catch (error) {
            console.error('Error loading schedules:', error.response || error)
            message.error('Không thể tải lịch học: ' + (error.response?.data || error.message))
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSchedule = (schedule) => {
        try {
            const parsedSchedule = JSON.parse(schedule.schedule)
            // Add unique keys to each schedule item if not present
            const scheduleDataWithKeys = parsedSchedule.map((item, index) => ({
                ...item,
                uniqueKey: item.id || `${item.courseName}-${item.classNumber}-${item.dayOfWeek}-${item.periods}-${index}`
            }))
            setSelectedSchedule({
                ...schedule,
                scheduleData: scheduleDataWithKeys
            })
            setFailedClasses([])
            setShowReplacements(false)
            setReplacementClasses({})
            setSelectedReplacements({})
        } catch (error) {
            message.error('Không thể hiển thị lịch học')
            console.error(error)
        }
    }

    const handleOpenEditModal = () => {
        if (!selectedSchedule) {
            message.warning('Vui lòng chọn một lịch học')
            return
        }
        setModalVisible(true)
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
                    if (selectedSchedule?.id === scheduleId) {
                        setSelectedSchedule(null)
                    }
                    loadSchedules()
                } catch (error) {
                    message.error('Không thể xóa lịch học')
                    console.error(error)
                }
            }
        })
    }

    const handleToggleFailedClass = (uniqueKey) => {
        setFailedClasses(prev => {
            if (prev.includes(uniqueKey)) {
                return prev.filter(key => key !== uniqueKey)
            } else {
                return [...prev, uniqueKey]
            }
        })
    }

    const handleLoadReplacements = async () => {
        if (failedClasses.length === 0) {
            message.warning('Vui lòng chọn ít nhất một lớp bị lỗi')
            return
        }

        const failedClassesData = selectedSchedule.scheduleData.filter(
            s => failedClasses.includes(s.uniqueKey)
        )

        const failedCourseNames = [...new Set(failedClassesData.map(s => s.courseName))]

        setLoadingReplacements(true)
        try {
            const allReplacementsPromises = failedCourseNames.map(courseName => {
                const failedClass = failedClassesData.find(c => c.courseName === courseName)
                return studentAPI.getSchedulesByCourse(courseName, failedClass?.subtopic)
            })
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
                initialSelections[failedClass.uniqueKey] = null
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
        const allSelected = failedClasses.every(key => selectedReplacements[key])

        if (!allSelected) {
            message.warning('Vui lòng chọn lớp thay thế cho tất cả các lớp bị lỗi')
            return
        }

        // Build new schedule
        const newScheduleData = selectedSchedule.scheduleData.filter(
            s => !failedClasses.includes(s.uniqueKey)
        )

        // Add replacement classes
        failedClasses.forEach(failedKey => {
            const replacement = selectedReplacements[failedKey]
            if (replacement) {
                newScheduleData.push(replacement)
            }
        })

        try {
            setLoading(true)

            // Prepare data for API - no need for semesterId when updating
            const updateData = {
                userId: user.id,
                semesterId: null, // Not needed for update
                schedules: newScheduleData.map(s => ({
                    courseName: s.courseName,
                    classNumber: s.classNumber,
                    language: s.language,
                    major: s.major,
                    classGroup: s.classGroup,
                    subtopic: s.subtopic,
                    instructor: s.instructor,
                    dayOfWeek: s.dayOfWeek,
                    periods: s.periods,
                    location: s.location,
                    roomNumber: s.roomNumber,
                    weeks: s.weeks,
                    capacity: s.capacity
                })),
                parsedPrompt: selectedSchedule.parsedPrompt
            }

            // Update existing schedule instead of creating new one
            await studentAPI.updateSchedule(selectedSchedule.id, updateData)

            // Update selectedSchedule with new data immediately
            const newScheduleDataWithKeys = newScheduleData.map((item, index) => ({
                ...item,
                uniqueKey: item.id || `${item.courseName}-${item.classNumber}-${item.dayOfWeek}-${item.periods}-${index}`
            }))

            setSelectedSchedule({
                ...selectedSchedule,
                scheduleData: newScheduleDataWithKeys
            })

            message.success('Đã cập nhật lịch thành công!')
            setModalVisible(false)
            setFailedClasses([])
            setShowReplacements(false)

            // Reload schedules in background
            loadSchedules()
        } catch (error) {
            message.error('Không thể lưu lịch mới')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAutoReschedule = async () => {
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
        if (!selectedSchedule) return []

        const successful = selectedSchedule.scheduleData.filter(
            s => !failedClasses.includes(s.uniqueKey)
        )

        const replacements = Object.values(selectedReplacements).filter(Boolean)

        return [...successful, ...replacements]
    }

    return (
        <div>
            <h1 style={{ color: 'var(--vku-navy)', fontWeight: 700 }}>Lịch Học Của Tôi</h1>

            {schedules.length === 0 ? (
                <Card style={{ marginTop: 24 }} className="vku-card">
                    <Empty
                        description="Chưa có lịch học nào được lưu"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/select-courses')}>
                            Bắt đầu xếp lịch
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    {/* Left: Schedule List */}
                    <Card
                        style={{ width: 350, flexShrink: 0 }}
                        className="vku-card"
                        title="Danh sách lịch học"
                    >
                        <List
                            loading={loading}
                            dataSource={schedules}
                            renderItem={(schedule) => (
                                <List.Item
                                    style={{
                                        cursor: 'pointer',
                                        background: selectedSchedule?.id === schedule.id ? '#e6f7ff' : 'transparent',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        border: selectedSchedule?.id === schedule.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
                                    }}
                                    onClick={() => handleSelectSchedule(schedule)}
                                >
                                    <List.Item.Meta
                                        avatar={<CalendarOutlined style={{ fontSize: 24, color: 'var(--vku-red)' }} />}
                                        title={
                                            <Space direction="vertical" size={2}>
                                                <span style={{ fontSize: 14, fontWeight: 600 }}>
                                                    {schedule.semesterName}
                                                </span>
                                                <Tag color="blue" style={{ fontSize: 11 }}>
                                                    {schedule.academicYear}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <div style={{ fontSize: 12 }}>
                                                {dayjs(schedule.createdAt).format('DD/MM/YYYY')}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* Right: Calendar View */}
                    <Card
                        style={{ flex: 1 }}
                        className="vku-card"
                        title={
                            selectedSchedule ? (
                                <Space>
                                    <span>Lịch học {selectedSchedule.semesterName}</span>
                                    <Tag color="blue">{selectedSchedule.academicYear}</Tag>
                                    {selectedSchedule.parsedPrompt && (
                                        <Tag color="purple">Tự động</Tag>
                                    )}
                                </Space>
                            ) : 'Chọn lịch học để xem'
                        }
                        extra={
                            selectedSchedule && (
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={handleOpenEditModal}
                                    >
                                        Sửa lỗi đăng ký
                                    </Button>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                                    >
                                        Xóa
                                    </Button>
                                </Space>
                            )
                        }
                    >
                        {selectedSchedule ? (
                            <MyScheduleCalendar
                                schedules={selectedSchedule.scheduleData}
                                failedClasses={[]}
                            />
                        ) : (
                            <Empty description="Chọn một lịch học từ danh sách bên trái" />
                        )}
                    </Card>
                </div>
            )}

            {/* Edit Schedule Modal */}
            <Modal
                title={
                    <Space>
                        <span>Sửa lỗi đăng ký - {selectedSchedule?.semesterName}</span>
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
                            disabled={!failedClasses.every(key => selectedReplacements[key])}
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
                {selectedSchedule && (
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
                                        {selectedSchedule.scheduleData.map(schedule => (
                                            <Checkbox
                                                key={schedule.uniqueKey}
                                                checked={failedClasses.includes(schedule.uniqueKey)}
                                                onChange={() => handleToggleFailedClass(schedule.uniqueKey)}
                                            >
                                                <Space>
                                                    <Tag color={failedClasses.includes(schedule.uniqueKey) ? 'error' : 'default'}>
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

                                <MyScheduleCalendar
                                    schedules={selectedSchedule.scheduleData}
                                    failedClasses={failedClasses}
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
                                            {selectedSchedule.scheduleData
                                                .filter(s => failedClasses.includes(s.uniqueKey))
                                                .map(failedClass => (
                                                    <Panel
                                                        header={
                                                            <Space>
                                                                <WarningOutlined style={{ color: '#ff4d4f' }} />
                                                                <strong>{failedClass.courseName}</strong>
                                                                <Tag color="error">Lớp {failedClass.classNumber} (Bị lỗi)</Tag>
                                                                {selectedReplacements[failedClass.uniqueKey] && (
                                                                    <Tag color="success">
                                                                        → Lớp {selectedReplacements[failedClass.uniqueKey].classNumber}
                                                                    </Tag>
                                                                )}
                                                            </Space>
                                                        }
                                                        key={failedClass.uniqueKey}
                                                    >
                                                        <Radio.Group
                                                            value={selectedReplacements[failedClass.uniqueKey]?.id}
                                                            onChange={(e) => {
                                                                const selected = replacementClasses[failedClass.courseName]?.find(
                                                                    r => r.id === e.target.value
                                                                )
                                                                handleSelectReplacement(failedClass.uniqueKey, selected)
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
