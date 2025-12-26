import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Button, Empty, Tag, Space, Modal, message } from 'antd'
import { DeleteOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons'
import { studentAPI, optimizationAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import MyScheduleCalendar from '../components/Schedule/MyScheduleCalendar'
import OptimizationModal from '../components/Schedule/OptimizationModal'
import EditScheduleModal from '../components/Schedule/EditScheduleModal'
import dayjs from 'dayjs'

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
    const [optimizationModalVisible, setOptimizationModalVisible] = useState(false)
    const [optimizationPrompt, setOptimizationPrompt] = useState('')
    const [optimizedSchedules, setOptimizedSchedules] = useState([])
    const [selectedOptimizedSchedule, setSelectedOptimizedSchedule] = useState(null)
    const [optimizing, setOptimizing] = useState(false)

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
                prompt: selectedSchedule.prompt, // Keep original prompt
                parsedPrompt: selectedSchedule.parsedPrompt // Keep original parsedPrompt
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
        if (failedClasses.length === 0) {
            message.warning('Vui lòng chọn ít nhất một lớp bị lỗi')
            return
        }

        // Get saved ORIGINAL prompt from schedule (not parsedPrompt JSON)
        const savedPrompt = selectedSchedule.prompt || 'Tối ưu hóa lịch học với ít ngày học nhất, tránh trùng lịch'

        // Open optimization modal with saved prompt
        setOptimizationModalVisible(true)
        setOptimizationPrompt(savedPrompt)
    }

    const handleOptimizeWithNSGAII = async () => {
        if (!optimizationPrompt.trim()) {
            message.warning('Vui lòng nhập yêu cầu tối ưu hóa')
            return
        }

        try {
            setOptimizing(true)

            // Get failed classes data
            const failedClassesData = selectedSchedule.scheduleData.filter(
                s => failedClasses.includes(s.uniqueKey)
            )

            // Get successful classes (not failed)
            const successfulClasses = selectedSchedule.scheduleData.filter(
                s => !failedClasses.includes(s.uniqueKey)
            )

            // Get unique course names from failed classes
            const failedCourseNames = [...new Set(failedClassesData.map(cls => cls.courseName))]

            // Get all course names (for querying database)
            const allCourseNames = [...new Set(failedClassesData.map(cls => cls.courseName))]

            // Check if prompt has changed
            const originalPrompt = selectedSchedule.prompt || ''
            const promptChanged = optimizationPrompt.trim() !== originalPrompt.trim()

            let response

            if (promptChanged) {
                // Prompt changed -> Call OPTIMIZATION_API (/api/convert)
                console.log('Prompt changed, calling OPTIMIZATION_API /api/convert')

                // Build queries for failed courses
                const queries = [...new Set(failedClassesData.map(cls => {
                    const subtopic = cls.subtopic
                    if (subtopic && subtopic.trim() && subtopic !== 'null' && subtopic !== 'undefined') {
                        return `${cls.courseName} @ ${subtopic}`
                    }
                    return cls.courseName
                }))]

                response = await optimizationAPI.optimizeSchedule(queries, optimizationPrompt)

                console.log('OPTIMIZATION_API response:', response.data)
            } else {
                // Prompt unchanged -> Call SCHEDULE_API (/api/reschedule)
                console.log('Prompt unchanged, calling SCHEDULE_API /api/reschedule')

                // parsedPrompt should already be a JSON object from database
                let parsedPromptObj = selectedSchedule.parsedPrompt || {}

                // Handle legacy data: if it's a string (old prompt format), parse it
                if (typeof parsedPromptObj === 'string') {
                    try {
                        parsedPromptObj = JSON.parse(parsedPromptObj)
                    } catch (e) {
                        console.error('Failed to parse parsedPrompt:', e)
                        parsedPromptObj = {}
                    }
                }

                console.log('Reschedule request:', {
                    selected_classes: successfulClasses,
                    parsed_prompt: parsedPromptObj,
                    failed_classes: failedCourseNames,
                    course_names: allCourseNames
                })

                response = await optimizationAPI.reschedule({
                    selected_classes: successfulClasses.map(cls => ({
                        course_name: cls.courseName,
                        class_index: cls.classNumber,
                        language: cls.language,
                        field: cls.major,
                        sub_topic: cls.subtopic || '',
                        teacher: cls.instructor,
                        day: cls.dayOfWeek,
                        periods: typeof cls.periods === 'string' ? cls.periods.split(',').map(Number) : cls.periods,
                        area: cls.location,
                        room: cls.roomNumber,
                        class_size: cls.capacity || 0
                    })),
                    parsed_prompt: parsedPromptObj,
                    failed_classes: failedCourseNames,
                    course_names: allCourseNames
                })

                console.log('SCHEDULE_API response:', response.data)
            }

            if (response.data && response.data.schedules && response.data.schedules.length > 0) {
                // Convert API response to our schedule format
                const convertedSchedules = response.data.schedules.map((scheduleOption, index) => {
                    console.log(`Converting schedule option ${index}:`, scheduleOption.schedule)

                    const scheduleData = scheduleOption.schedule.map((item, sessionIndex) => {
                        // Handle both formats: [course_name, session] or just session
                        const session = Array.isArray(item) && item.length >= 2 ? item[1] : item

                        console.log(`  Session ${sessionIndex}:`, session)

                        // Map API session format to our schedule format
                        return {
                            courseName: session.course_name || session.courseName,
                            classNumber: session.class_index || session.classIndex,
                            language: session.language,
                            major: session.field,
                            classGroup: '', // Not provided by API
                            subtopic: session.sub_topic || session.subTopic || '',
                            instructor: session.teacher,
                            dayOfWeek: session.day,
                            periods: Array.isArray(session.periods) ? session.periods.join(',') : session.periods,
                            location: session.area,
                            roomNumber: session.room,
                            weeks: '', // Not provided by API
                            capacity: session.class_size || session.classSize,
                            uniqueKey: `opt-${index}-${sessionIndex}-${session.course_name || session.courseName}-${session.class_index || session.classIndex}-${session.day}`
                        }
                    })

                    console.log(`  Converted schedule data for option ${index}:`, scheduleData)

                    return {
                        id: scheduleOption.id || `schedule-${index}`,
                        score: scheduleOption.score,
                        scheduleData
                    }
                })

                console.log('All converted schedules:', convertedSchedules)

                setOptimizedSchedules(convertedSchedules)
                message.success(`Đã tìm thấy ${convertedSchedules.length} phương án tối ưu`)
            } else {
                message.warning('Không tìm thấy phương án tối ưu nào')
            }
        } catch (error) {
            console.error('Optimization error:', error)
            message.error('Không thể xếp lịch tự động: ' + (error.response?.data?.error || error.message))
        } finally {
            setOptimizing(false)
        }
    }

    const handleSelectOptimizedSchedule = (schedule) => {
        setSelectedOptimizedSchedule(schedule)
    }

    const handleApplyOptimizedSchedule = async () => {
        if (!selectedOptimizedSchedule) {
            message.warning('Vui lòng chọn một phương án tối ưu')
            return
        }

        try {
            setLoading(true)

            // Build new schedule: keep successful classes + add optimized classes
            const successfulClasses = selectedSchedule.scheduleData.filter(
                s => !failedClasses.includes(s.uniqueKey)
            )

            console.log('Successful classes (not rescheduled):', successfulClasses)
            console.log('Optimized schedule data (rescheduled):', selectedOptimizedSchedule.scheduleData)

            const newScheduleData = [...successfulClasses, ...selectedOptimizedSchedule.scheduleData]

            console.log('Final merged schedule:', newScheduleData)

            // Check if prompt changed to determine what to save
            const originalPrompt = selectedSchedule.prompt || ''
            const promptChanged = optimizationPrompt.trim() !== originalPrompt.trim()

            // Update schedule
            const updateData = {
                userId: user.id,
                semesterId: null,
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
                prompt: optimizationPrompt, // Save new prompt text
                parsedPrompt: promptChanged ? null : selectedSchedule.parsedPrompt // Keep old parsedPrompt if prompt unchanged
            }

            await studentAPI.updateSchedule(selectedSchedule.id, updateData)

            // Update UI
            const newScheduleDataWithKeys = newScheduleData.map((item, index) => ({
                ...item,
                uniqueKey: item.uniqueKey || `${item.courseName}-${item.classNumber}-${item.dayOfWeek}-${item.periods}-${index}`
            }))

            setSelectedSchedule({
                ...selectedSchedule,
                scheduleData: newScheduleDataWithKeys,
                prompt: optimizationPrompt,
                parsedPrompt: promptChanged ? null : selectedSchedule.parsedPrompt
            })

            message.success('Đã áp dụng lịch tối ưu thành công!')

            // Close modals and reset state
            setOptimizationModalVisible(false)
            setModalVisible(false)
            setFailedClasses([])
            setOptimizedSchedules([])
            setSelectedOptimizedSchedule(null)

            // Reload schedules
            loadSchedules()
        } catch (error) {
            console.error('Apply optimization error:', error)
            message.error('Không thể áp dụng lịch tối ưu')
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
                                                <div>{dayjs(schedule.createdAt).format('DD/MM/YYYY')}</div>
                                                {schedule.parsedPrompt && (
                                                    <div style={{
                                                        marginTop: 4,
                                                        color: '#8c8c8c',
                                                        fontStyle: 'italic',
                                                        fontSize: 11,
                                                        maxWidth: '100%',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <span style={{ color: '#52c41a', fontWeight: 500 }}>✓</span> Tối ưu hóa
                                                    </div>
                                                )}
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

            {/* NSGA-II Optimization Modal */}
            <OptimizationModal
                visible={optimizationModalVisible}
                onCancel={() => {
                    setOptimizationModalVisible(false)
                    setOptimizedSchedules([])
                    setSelectedOptimizedSchedule(null)
                }}
                optimizing={optimizing}
                optimizedSchedules={optimizedSchedules}
                selectedOptimizedSchedule={selectedOptimizedSchedule}
                onSelectOptimizedSchedule={handleSelectOptimizedSchedule}
                onApplyOptimizedSchedule={handleApplyOptimizedSchedule}
                onOptimize={handleOptimizeWithNSGAII}
                optimizationPrompt={optimizationPrompt}
                onPromptChange={setOptimizationPrompt}
                failedClasses={failedClasses}
                selectedSchedule={selectedSchedule}
            />

            {/* Edit Schedule Modal */}
            <EditScheduleModal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    setFailedClasses([])
                    setShowReplacements(false)
                }}
                selectedSchedule={selectedSchedule}
                failedClasses={failedClasses}
                onToggleFailedClass={handleToggleFailedClass}
                showReplacements={showReplacements}
                onShowReplacements={handleLoadReplacements}
                onBackToSelection={() => setShowReplacements(false)}
                replacementClasses={replacementClasses}
                selectedReplacements={selectedReplacements}
                onSelectReplacement={handleSelectReplacement}
                onSaveNewSchedule={handleSaveNewSchedule}
                loadingReplacements={loadingReplacements}
                onAutoReschedule={handleAutoReschedule}
                previewSchedule={getPreviewSchedule()}
            />
        </div>
    )
}

export default MySchedules
