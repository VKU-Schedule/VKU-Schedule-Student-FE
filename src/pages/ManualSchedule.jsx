import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, Tabs, Button, Space, message, List, Tag, Spin, Alert } from 'antd'
import { SaveOutlined, DeleteOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { studentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WeeklyCalendar from '../components/Schedule/WeeklyCalendar'
import CourseSelector from '../components/Course/CourseSelector'
import CourseSearch from '../components/Course/CourseSearch'
import SaveScheduleModal from '../components/Schedule/SaveScheduleModal'
import { formatCourseName, findConflict } from '../utils/courseUtils'

const ManualSchedule = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const selectedCoursesFromPrev = location.state?.selectedCourses || []

    // Reschedule mode data
    const rescheduleMode = location.state?.rescheduleMode || false
    const successfulClasses = location.state?.successfulClasses || []
    const failedClasses = location.state?.failedClasses || []
    const failedCourseNames = location.state?.failedCourseNames || []

    const [loading, setLoading] = useState(false)
    const [selectedCourses, setSelectedCourses] = useState(selectedCoursesFromPrev)
    const [currentCourse, setCurrentCourse] = useState(null)
    const [allSchedules, setAllSchedules] = useState([])
    const [confirmedSchedules, setConfirmedSchedules] = useState(rescheduleMode ? successfulClasses : [])
    const [viewMode, setViewMode] = useState('selecting') // 'selecting' or 'final'

    // Save schedule modal
    const [saveModalVisible, setSaveModalVisible] = useState(false)
    const [saving, setSaving] = useState(false)
    const [academicYears, setAcademicYears] = useState([])
    const [semesters, setSemesters] = useState([])
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null)
    const [selectedSemester, setSelectedSemester] = useState(null)

    // Helper to normalize subtopic for comparison (null, undefined, 'null', '' all become null)
    const normalizeSubtopic = (val) => {
        if (val === null || val === undefined || val === 'null' || val === '') return null
        return val
    }

    // Helper to check if two courses match (same courseName and subtopic)
    const isSameCourse = (course1, course2) => {
        return course1.courseName === course2.courseName &&
            normalizeSubtopic(course1.subtopic) === normalizeSubtopic(course2.subtopic)
    }

    // Load schedules for pre-selected courses or reschedule mode
    useEffect(() => {
        if (rescheduleMode && failedCourseNames.length > 0) {
            // Load schedules for failed courses
            loadSchedulesForFailedCourses()
        } else if (selectedCoursesFromPrev.length > 0) {
            loadSchedulesForCourses(selectedCoursesFromPrev)
        }
    }, [])

    const loadSchedulesForFailedCourses = async () => {
        setLoading(true)
        try {
            const allSchedulesPromises = failedCourseNames.map(courseName =>
                studentAPI.getSchedulesByCourse(courseName)
            )
            const results = await Promise.all(allSchedulesPromises)
            const combinedSchedules = results.flatMap(r => r.data)

            // Add successful classes to allSchedules for display
            setAllSchedules([...successfulClasses, ...combinedSchedules])

            message.success(`Đã load ${combinedSchedules.length} lớp thay thế cho ${failedCourseNames.length} môn bị lỗi`)
        } catch (error) {
            message.error('Không thể tải lịch học')
        } finally {
            setLoading(false)
        }
    }

    const loadSchedulesForCourses = async (courses) => {
        setLoading(true)
        try {
            const allSchedulesPromises = courses.map(course =>
                studentAPI.getSchedulesByCourse(course.courseName, course.subtopic)
            )
            const results = await Promise.all(allSchedulesPromises)
            const combinedSchedules = results.flatMap(r => r.data)
            setAllSchedules(combinedSchedules)
        } catch (error) {
            message.error('Không thể tải lịch học')
        } finally {
            setLoading(false)
        }
    }

    const handleCourseSelect = async (course) => {
        // Check if course already selected
        const exists = selectedCourses.find(c => c.id === course.id)
        if (exists) {
            message.warning('Môn học đã được chọn')
            return
        }

        setSelectedCourses([...selectedCourses, course])
        message.success(`Đã thêm môn: ${formatCourseName(course.courseName, course.subtopic)}`)

        // Load schedules for this course
        setLoading(true)
        try {
            const response = await studentAPI.getSchedulesByCourse(course.courseName, course.subtopic)
            setAllSchedules([...allSchedules, ...response.data])
        } catch (error) {
            message.error('Không thể tải lịch học cho môn này')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveCourse = (courseId) => {
        const course = selectedCourses.find(c => c.id === courseId)
        if (!course) return

        // Remove course
        setSelectedCourses(selectedCourses.filter(c => c.id !== courseId))

        // Remove all schedules of this course (match both courseName and subtopic)
        setAllSchedules(allSchedules.filter(s => !isSameCourse(s, course)))
        setConfirmedSchedules(confirmedSchedules.filter(s => !isSameCourse(s, course)))

        // If removing current course, clear it
        if (currentCourse && currentCourse.id === courseId) {
            setCurrentCourse(null)
        }

        message.info('Đã xóa môn học và các lớp liên quan')
    }

    const handleScheduleClick = (schedule) => {
        // If this schedule is already confirmed
        const isConfirmed = confirmedSchedules.some(s => s.id === schedule.id)

        if (isConfirmed) {
            // Unconfirm it
            setConfirmedSchedules(confirmedSchedules.filter(s => s.id !== schedule.id))
            message.info('Đã bỏ chọn lớp')
            return
        }

        // Check if it's from the current course (match both courseName and subtopic)
        const isCurrentCourse = currentCourse && isSameCourse(schedule, currentCourse)

        if (isCurrentCourse) {
            // Check for conflicts with confirmed schedules
            const conflictInfo = checkConflict(schedule, confirmedSchedules)

            if (conflictInfo) {
                const conflictingSchedule = findConflict(schedule, confirmedSchedules)

                if (conflictingSchedule) {
                    message.error({
                        content: (
                            <div>
                                <strong>⚠️ Trùng lịch!</strong>
                                <div style={{ marginTop: 8 }}>
                                    Lớp này trùng với: <strong>{formatCourseName(conflictingSchedule.courseName, conflictingSchedule.subtopic)}</strong>
                                </div>
                                <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                                    {schedule.dayOfWeek} - Tiết {schedule.periods}
                                </div>
                            </div>
                        ),
                        duration: 4
                    })
                } else {
                    message.warning('Lớp này bị trùng lịch với lớp đã chọn!')
                }
                return
            }

            // Remove other confirmed schedules of the same course (match both courseName and subtopic)
            const otherConfirmed = confirmedSchedules.filter(s => !isSameCourse(s, schedule))
            setConfirmedSchedules([...otherConfirmed, schedule])
            message.success('Đã chọn lớp')
        } else {
            // It's a preview from another course
            message.info('Đây là lớp của môn khác, click vào chip môn học ở trên để chọn môn này')
        }
    }

    const handleCourseClickForPreview = async (course) => {
        if (currentCourse && currentCourse.id === course.id) {
            // Already selected, do nothing
            return
        }

        setCurrentCourse(course)

        // Load schedules for this course if not loaded (match both courseName and subtopic)
        const courseSchedules = allSchedules.filter(s => isSameCourse(s, course))

        if (courseSchedules.length === 0) {
            setLoading(true)
            try {
                const response = await studentAPI.getSchedulesByCourse(course.courseName, course.subtopic)
                setAllSchedules([...allSchedules, ...response.data])
            } catch (error) {
                message.error('Không thể tải lịch học')
            } finally {
                setLoading(false)
            }
        }
    }

    const checkConflict = (newSchedule, existingSchedules) => {
        return findConflict(newSchedule, existingSchedules) !== null
    }

    const handleSaveSchedule = async () => {
        if (confirmedSchedules.length === 0) {
            message.warning('Chưa chọn lớp nào')
            return
        }

        // Load academic years for modal
        try {
            const response = await studentAPI.getAcademicYears()
            setAcademicYears(response.data)
            setSaveModalVisible(true)
        } catch (error) {
            message.error('Không thể tải danh sách năm học')
        }
    }

    const handleAcademicYearChange = async (value) => {
        setSelectedAcademicYear(value)
        setSelectedSemester(null)
        setSemesters([])

        if (!value) return

        try {
            const response = await studentAPI.getSemesters(value)
            setSemesters(response.data)
        } catch (error) {
            message.error('Không thể tải danh sách học kỳ')
        }
    }

    const handleConfirmSave = async () => {
        if (!selectedSemester) {
            message.warning('Vui lòng chọn học kỳ')
            return
        }

        if (!user || !user.id) {
            message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
            return
        }

        setSaving(true)
        try {
            // Convert Schedule entities to ScheduleDTO format
            const scheduleDTOs = confirmedSchedules.map(schedule => ({
                courseName: schedule.courseName,
                classNumber: schedule.classNumber,
                language: schedule.language,
                major: schedule.major,
                classGroup: schedule.classGroup,
                subtopic: schedule.subtopic,
                instructor: schedule.instructor,
                dayOfWeek: schedule.dayOfWeek,
                periods: schedule.periods,
                location: schedule.location,
                roomNumber: schedule.roomNumber,
                weeks: schedule.weeks,
                capacity: schedule.capacity
            }))

            const saveRequest = {
                userId: user.id,
                semesterId: selectedSemester,
                schedules: scheduleDTOs,
                parsedPrompt: null // Manual schedule, no prompt
            }

            await studentAPI.saveSchedule(saveRequest)

            message.success({
                content: 'Đã lưu lịch học thành công!',
                duration: 3
            })

            setSaveModalVisible(false)
            setSelectedAcademicYear(null)
            setSelectedSemester(null)

            // Navigate to my schedules page after 1 second
            setTimeout(() => {
                navigate('/my-schedules')
            }, 1000)
        } catch (error) {
            message.error('Không thể lưu lịch học: ' + (error.response?.data || error.message))
        } finally {
            setSaving(false)
        }
    }

    const handleCancelSave = () => {
        setSaveModalVisible(false)
        setSelectedAcademicYear(null)
        setSelectedSemester(null)
        setSemesters([])
    }

    const tabItems = [
        {
            key: 'dropdown',
            label: 'Chọn từ danh sách',
            children: (
                <Card>
                    <CourseSelector onCourseSelect={handleCourseSelect} />
                </Card>
            )
        },
        {
            key: 'search',
            label: 'Tìm kiếm',
            children: (
                <Card>
                    <CourseSearch onCourseSelect={handleCourseSelect} />
                </Card>
            )
        }
    ]

    // Get schedules to display in calendar
    const getDisplaySchedules = () => {
        // If in final view mode, only show confirmed schedules
        if (viewMode === 'final') {
            return confirmedSchedules
        }

        // If selecting and a course is active
        if (currentCourse) {
            // Show all schedules of current course (includes both confirmed and unconfirmed)
            // Match both courseName and subtopic
            const currentCourseSchedules = allSchedules.filter(s => isSameCourse(s, currentCourse))

            // Also show confirmed schedules from other courses
            const otherConfirmedSchedules = confirmedSchedules.filter(s => !isSameCourse(s, currentCourse))

            return [...otherConfirmedSchedules, ...currentCourseSchedules]
        }

        return confirmedSchedules
    }

    const handleFinishSelecting = () => {
        if (confirmedSchedules.length === 0) {
            message.warning('Chưa chọn lớp nào')
            return
        }
        setViewMode('final')
        setCurrentCourse(null)
        message.success('Đã hoàn tất chọn lớp. Đang hiển thị lịch cuối cùng.')
    }

    const handleBackToSelecting = () => {
        setViewMode('selecting')
        message.info('Quay lại chế độ chọn lớp')
    }

    const getChipColor = (index) => {
        const colors = ['course-chip-red', 'course-chip-yellow', 'course-chip-navy']
        return colors[index % colors.length]
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'var(--vku-navy)', fontWeight: 700, margin: 0 }}>
                    {rescheduleMode ? 'Xếp Lại Lịch' : 'Xếp Lịch Thủ Công'}
                </h1>
                {viewMode === 'final' && (
                    <Button
                        type="default"
                        onClick={handleBackToSelecting}
                    >
                        Quay lại chọn lớp
                    </Button>
                )}
            </div>

            {/* Reschedule Mode Alert */}
            {rescheduleMode && (
                <Alert
                    message="Chế độ xếp lại lịch"
                    description={
                        <Space direction="vertical" size="small">
                            <div>
                                <strong>✓ {successfulClasses.length} lớp đã đăng ký thành công</strong> (màu đậm - giữ nguyên)
                            </div>
                            <div>
                                <WarningOutlined style={{ color: '#ff4d4f' }} /> <strong>{failedClasses.length} lớp bị lỗi</strong> - Cần chọn lớp thay thế
                            </div>
                            <div>
                                Hãy chọn lớp thay thế cho các môn: <strong>{failedCourseNames.join(', ')}</strong>
                            </div>
                        </Space>
                    }
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                    closable
                />
            )}

            {/* Course Selection - Always show when in selecting mode */}
            {viewMode === 'selecting' && (
                <Card style={{ marginTop: 24 }} className="vku-card">
                    <div style={{ marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>Chọn môn học</h3>
                    </div>
                    <Spin spinning={loading}>
                        <Tabs items={tabItems} />
                    </Spin>
                </Card>
            )}

            {/* Selected Courses */}
            {selectedCourses.length > 0 && viewMode === 'selecting' && (
                <Card style={{ marginTop: 24 }} className="vku-card">
                    <div className="vku-card-header">
                        <CheckCircleOutlined style={{ fontSize: 24, color: 'var(--vku-red)' }} />
                        <h2 className="vku-card-title">Môn học đã chọn</h2>
                        <span className="vku-badge">{selectedCourses.length}</span>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        {selectedCourses.map((course, index) => {
                            const isCurrentCourse = currentCourse && currentCourse.id === course.id
                            const hasConfirmedClass = confirmedSchedules.some(s => isSameCourse(s, course))

                            return (
                                <span
                                    key={course.id}
                                    className={`course-chip ${getChipColor(index)}`}
                                    onClick={() => handleCourseClickForPreview(course)}
                                    style={{
                                        cursor: 'pointer',
                                        opacity: isCurrentCourse ? 1 : 0.7,
                                        border: isCurrentCourse ? '2px solid var(--vku-red)' : 'none'
                                    }}
                                >
                                    {hasConfirmedClass && <CheckCircleOutlined style={{ marginRight: 4 }} />}
                                    {formatCourseName(course.courseName, course.subtopic)}
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveCourse(course.id)
                                        }}
                                        style={{
                                            marginLeft: 8,
                                            color: 'inherit',
                                            minWidth: 'auto',
                                            padding: '0 4px'
                                        }}
                                    />
                                </span>
                            )
                        })}
                    </div>
                </Card>
            )}

            {/* Calendar */}
            {selectedCourses.length > 0 && (
                <Card
                    title={
                        <Space>
                            <span>Thời khóa biểu</span>
                            {viewMode === 'final' && (
                                <Tag color="green">Lịch cuối cùng</Tag>
                            )}
                            {viewMode === 'selecting' && currentCourse && (
                                <Tag color="blue">Đang chọn: {formatCourseName(currentCourse.courseName, currentCourse.subtopic)}</Tag>
                            )}
                        </Space>
                    }
                    style={{ marginTop: 24 }}
                    className="vku-card"
                    extra={
                        <Space>
                            {viewMode === 'selecting' && confirmedSchedules.length > 0 && (
                                <Button
                                    type="default"
                                    onClick={handleFinishSelecting}
                                >
                                    Xong
                                </Button>
                            )}
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleSaveSchedule}
                                disabled={confirmedSchedules.length === 0}
                            >
                                Lưu lịch ({confirmedSchedules.length})
                            </Button>
                        </Space>
                    }
                >


                    <Spin spinning={loading}>
                        <WeeklyCalendar
                            schedules={getDisplaySchedules()}
                            confirmedSchedules={confirmedSchedules}
                            currentCourse={viewMode === 'selecting' ? currentCourse : null}
                            onSelectSchedule={viewMode === 'selecting' ? handleScheduleClick : null}
                            showConflicts={viewMode === 'selecting'}
                        />
                    </Spin>
                </Card>
            )}

            {/* Confirmed Classes List */}
            {confirmedSchedules.length > 0 && (
                <Card
                    title={`Lớp đã chọn (${confirmedSchedules.length})`}
                    style={{ marginTop: 24 }}
                    className="vku-card"
                >
                    <List
                        dataSource={confirmedSchedules}
                        renderItem={(schedule) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                            setConfirmedSchedules(confirmedSchedules.filter(s => s.id !== schedule.id))
                                            message.info('Đã xóa lớp')
                                        }}
                                    >
                                        Xóa
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <CheckCircleOutlined style={{ color: 'var(--vku-red)' }} />
                                            {schedule.courseName}
                                            {schedule.classNumber && (
                                                <Tag color="blue">Lớp {schedule.classNumber}</Tag>
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" size="small">
                                            <div>
                                                <Tag>{schedule.dayOfWeek}</Tag>
                                                <Tag>Tiết {schedule.periods}</Tag>
                                                <Tag>{schedule.location}.{schedule.roomNumber}</Tag>
                                            </div>
                                            <div>Giảng viên: {schedule.instructor}</div>
                                            {schedule.classGroup && (
                                                <div>Dành cho: {schedule.classGroup}</div>
                                            )}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Save Schedule Modal */}
            <SaveScheduleModal
                visible={saveModalVisible}
                onCancel={handleCancelSave}
                onConfirm={handleConfirmSave}
                loading={saving}
                confirmedSchedules={confirmedSchedules}
                academicYears={academicYears}
                semesters={semesters}
                selectedAcademicYear={selectedAcademicYear}
                selectedSemester={selectedSemester}
                onAcademicYearChange={handleAcademicYearChange}
                onSemesterChange={setSelectedSemester}
            />
        </div>
    )
}

export default ManualSchedule
