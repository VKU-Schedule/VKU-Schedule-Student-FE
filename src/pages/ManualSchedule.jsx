import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, Tabs, Button, Space, message, List, Tag, Spin } from 'antd'
import { SaveOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { studentAPI } from '../services/api'
import WeeklyCalendar from '../components/Schedule/WeeklyCalendar'
import CourseSelector from '../components/Course/CourseSelector'
import CourseSearch from '../components/Course/CourseSearch'

const ManualSchedule = () => {
    const location = useLocation()
    const selectedCoursesFromPrev = location.state?.selectedCourses || []

    const [loading, setLoading] = useState(false)
    const [selectedCourses, setSelectedCourses] = useState(selectedCoursesFromPrev)
    const [currentCourse, setCurrentCourse] = useState(null)
    const [allSchedules, setAllSchedules] = useState([])
    const [confirmedSchedules, setConfirmedSchedules] = useState([])
    const [viewMode, setViewMode] = useState('selecting') // 'selecting' or 'final'

    // Load schedules for pre-selected courses
    useEffect(() => {
        if (selectedCoursesFromPrev.length > 0) {
            loadSchedulesForCourses(selectedCoursesFromPrev)
        }
    }, [])

    const loadSchedulesForCourses = async (courses) => {
        setLoading(true)
        try {
            const allSchedulesPromises = courses.map(course =>
                studentAPI.getSchedulesByCourse(course.courseName)
            )
            const results = await Promise.all(allSchedulesPromises)
            const combinedSchedules = results.flatMap(r => r.data)
            setAllSchedules(combinedSchedules)
        } catch (error) {
            message.error('Không thể tải lịch học')
            console.error(error)
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
        message.success(`Đã thêm môn: ${course.courseName}`)

        // Load schedules for this course
        setLoading(true)
        try {
            const response = await studentAPI.getSchedulesByCourse(course.courseName)
            setAllSchedules([...allSchedules, ...response.data])
        } catch (error) {
            message.error('Không thể tải lịch học cho môn này')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveCourse = (courseId) => {
        const course = selectedCourses.find(c => c.id === courseId)
        if (!course) return

        // Remove course
        setSelectedCourses(selectedCourses.filter(c => c.id !== courseId))

        // Remove all schedules of this course
        setAllSchedules(allSchedules.filter(s => s.courseName !== course.courseName))
        setConfirmedSchedules(confirmedSchedules.filter(s => s.courseName !== course.courseName))

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

        // Check if it's from the current course
        const isCurrentCourse = currentCourse && schedule.courseName === currentCourse.courseName

        if (isCurrentCourse) {
            // Check for conflicts with confirmed schedules
            const hasConflict = checkConflict(schedule, confirmedSchedules)

            if (hasConflict) {
                message.warning('Lớp này bị trùng lịch với lớp đã chọn!')
                return
            }

            // Remove other confirmed schedules of the same course
            const otherConfirmed = confirmedSchedules.filter(s => s.courseName !== schedule.courseName)
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

        // Load schedules for this course if not loaded
        const courseSchedules = allSchedules.filter(s => s.courseName === course.courseName)
        if (courseSchedules.length === 0) {
            setLoading(true)
            try {
                const response = await studentAPI.getSchedulesByCourse(course.courseName)
                setAllSchedules([...allSchedules, ...response.data])
            } catch (error) {
                message.error('Không thể tải lịch học')
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const checkConflict = (newSchedule, existingSchedules) => {
        const parsePeriods = (periodsStr) => {
            try {
                if (typeof periodsStr === 'string') {
                    const cleaned = periodsStr.replace(/[\[\]]/g, '')
                    return cleaned.split(',').map(p => parseInt(p.trim()))
                }
                return periodsStr || []
            } catch {
                return []
            }
        }

        const newPeriods = parsePeriods(newSchedule.periods)
        const newDay = newSchedule.dayOfWeek

        for (const existing of existingSchedules) {
            if (existing.dayOfWeek === newDay) {
                const existingPeriods = parsePeriods(existing.periods)
                const overlap = newPeriods.some(p => existingPeriods.includes(p))
                if (overlap) {
                    return true
                }
            }
        }

        return false
    }

    const handleSaveSchedule = async () => {
        if (confirmedSchedules.length === 0) {
            message.warning('Chưa chọn lớp nào')
            return
        }

        message.info('Chức năng lưu lịch đang phát triển. Cần chọn học kỳ trước.')
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
            const currentCourseSchedules = allSchedules.filter(s => s.courseName === currentCourse.courseName)

            // Also show confirmed schedules from other courses
            const otherConfirmedSchedules = confirmedSchedules.filter(s => s.courseName !== currentCourse.courseName)

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
                <h1 style={{ color: 'var(--vku-navy)', fontWeight: 700, margin: 0 }}>Xếp Lịch Thủ Công</h1>
                {viewMode === 'final' && (
                    <Button
                        type="default"
                        onClick={handleBackToSelecting}
                    >
                        Quay lại chọn lớp
                    </Button>
                )}
            </div>

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
                            const hasConfirmedClass = confirmedSchedules.some(s => s.courseName === course.courseName)

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
                                    {course.courseName}
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
                                <Tag color="blue">Đang chọn: {currentCourse.courseName}</Tag>
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
        </div>
    )
}

export default ManualSchedule
