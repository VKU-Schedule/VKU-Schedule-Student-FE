import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tabs, List, Button, Tag, Space, message } from 'antd'
import { DeleteOutlined, ThunderboltOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons'
import CourseSelector from '../components/Course/CourseSelector'
import CourseSearch from '../components/Course/CourseSearch'
import AutoScheduleModal from '../components/Schedule/AutoScheduleModal'
import SaveScheduleModal from '../components/Schedule/SaveScheduleModal'
import { formatCourseName } from '../utils/courseUtils'
import { optimizationAPI, studentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const SelectCourses = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [selectedCourses, setSelectedCourses] = useState([])

    // Auto schedule modal states
    const [autoScheduleModalVisible, setAutoScheduleModalVisible] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    // Step 1: Preferences/Prompt
    const [prompt, setPrompt] = useState('Tối ưu hóa lịch học với ít ngày học nhất, tránh trùng lịch')

    // Step 2: Weights
    const [weights, setWeights] = useState({
        teacher: 3,
        classGroup: 3,
        day: 3,
        consecutive: 3,
        rest: 3,
        room: 3
    })

    // Step 3: Optimization
    const [optimizing, setOptimizing] = useState(false)
    const [optimizedSchedules, setOptimizedSchedules] = useState([])
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null)

    // Step 4: Save
    const [saving, setSaving] = useState(false)

    // Semester selection for saving
    const [saveModalVisible, setSaveModalVisible] = useState(false)
    const [academicYears, setAcademicYears] = useState([])
    const [semesters, setSemesters] = useState([])
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null)
    const [selectedSemester, setSelectedSemester] = useState(null)

    const handleCourseSelect = (course) => {
        // Check if course already selected
        const exists = selectedCourses.find(c => c.id === course.id)
        if (exists) {
            message.warning('Môn học đã được chọn')
            return
        }

        setSelectedCourses([...selectedCourses, course])
        message.success(`Đã thêm môn: ${course.courseName}`)
    }

    const handleRemoveCourse = (courseId) => {
        setSelectedCourses(selectedCourses.filter(c => c.id !== courseId))
        message.info('Đã xóa môn học')
    }

    const handleClearAll = () => {
        setSelectedCourses([])
        message.info('Đã xóa tất cả môn học')
    }

    const handleAutoSchedule = () => {
        if (selectedCourses.length === 0) {
            message.warning('Vui lòng chọn ít nhất một môn học')
            return
        }

        // Reset states and open modal
        setCurrentStep(0)
        setPrompt('Tối ưu hóa lịch học với ít ngày học nhất, tránh trùng lịch')
        setWeights({
            teacher: 3,
            classGroup: 3,
            day: 3,
            consecutive: 3,
            rest: 3,
            room: 3
        })
        setOptimizedSchedules([])
        setSelectedScheduleIndex(null)
        setAutoScheduleModalVisible(true)
    }

    // Quick templates for prompt
    const promptTemplates = [
        { label: 'Học buổi sáng', text: 'tôi thích học buổi sáng' },
        { label: 'Học buổi chiều', text: 'tôi thích học buổi chiều' },
        { label: 'Không học cuối tuần', text: 'không học thứ bảy và chủ nhật' },
        { label: 'Tập trung trong tuần', text: 'tôi muốn học tập trung từ thứ hai đến thứ sáu' },
        { label: 'Không khoảng trống', text: 'tránh khoảng trống giữa các tiết học' }
    ]

    const insertTemplate = (template) => {
        const newPrompt = prompt ? `${prompt}, ${template}` : template
        setPrompt(newPrompt)
    }

    const handleWeightChange = (key, value) => {
        setWeights({ ...weights, [key]: value })
    }

    // Weight configuration
    const weightConfigs = [
        { key: 'teacher', label: 'Giảng viên', description: 'Ưu tiên giảng viên phù hợp', icon: '👨‍🏫' },
        { key: 'classGroup', label: 'Nhóm lớp', description: 'Học cùng nhóm bạn', icon: '👥' },
        { key: 'day', label: 'Ngày học', description: 'Phân bổ ngày học hợp lý', icon: '📅' },
        { key: 'consecutive', label: 'Tiết liên tiếp', description: 'Học các tiết liên tiếp nhau', icon: '⏱️' },
        { key: 'rest', label: 'Khoảng nghỉ', description: 'Có thời gian nghỉ giữa các tiết', icon: '☕' },
        { key: 'room', label: 'Phòng học', description: 'Phòng học thuận tiện', icon: '🏫' }
    ]

    // Run optimization
    const handleOptimize = async () => {
        if (!prompt.trim()) {
            message.warning('Vui lòng nhập yêu cầu tối ưu hóa')
            return
        }

        setOptimizing(true)
        setCurrentStep(2)

        try {
            // Build queries array from selected courses
            // If subTopic is empty/null/"null": just courseName
            // If subTopic has value: courseName @ subTopic
            const queries = [...new Set(selectedCourses.map(course => {
                const subtopic = course.subtopic
                if (subtopic && subtopic.trim() && subtopic !== 'null' && subtopic !== 'undefined') {
                    return `${course.courseName} @ ${subtopic}`
                }
                return course.courseName
            }))]

            console.log('Optimization request:', { queries, prompt })

            // Call NSGA-II API
            const response = await optimizationAPI.optimizeSchedule(queries, prompt)

            console.log('Optimization response:', response.data)

            if (response.data && response.data.schedules && response.data.schedules.length > 0) {
                // Convert API response to our schedule format
                const convertedSchedules = response.data.schedules.map((scheduleOption, index) => {
                    const scheduleData = scheduleOption.schedule.map((item, sessionIndex) => {
                        // Handle both formats: [course_name, session] or just session
                        const session = Array.isArray(item) && item.length >= 2 ? item[1] : item

                        return {
                            courseName: session.course_name || session.courseName,
                            classNumber: session.class_index || session.classIndex,
                            language: session.language,
                            major: session.field,
                            classGroup: '',
                            subtopic: session.sub_topic || session.subTopic || '',
                            instructor: session.teacher,
                            dayOfWeek: session.day,
                            periods: Array.isArray(session.periods) ? session.periods.join(',') : session.periods,
                            location: session.area,
                            roomNumber: session.room,
                            weeks: '',
                            capacity: session.class_size || session.classSize,
                            uniqueKey: `opt-${index}-${sessionIndex}-${session.course_name || session.courseName}-${session.class_index || session.classIndex}`
                        }
                    })

                    return {
                        id: scheduleOption.id || `schedule-${index}`,
                        score: scheduleOption.score,
                        scheduleData,
                        // Calculate stats
                        totalClasses: scheduleData.length,
                        daysPerWeek: [...new Set(scheduleData.map(s => s.dayOfWeek))].length,
                        subjects: [...new Set(scheduleData.map(s => s.courseName))]
                    }
                })

                setOptimizedSchedules(convertedSchedules)
                message.success(`Đã tìm thấy ${convertedSchedules.length} phương án tối ưu`)
                setCurrentStep(3)
            } else {
                message.warning('Không tìm thấy phương án tối ưu nào')
                setCurrentStep(1)
            }
        } catch (error) {
            console.error('Optimization error:', error)
            message.error('Không thể xếp lịch tự động: ' + (error.response?.data?.error || error.message))
            setCurrentStep(1)
        } finally {
            setOptimizing(false)
        }
    }

    // Open save modal
    const handleOpenSaveModal = async () => {
        if (selectedScheduleIndex === null) {
            message.warning('Vui lòng chọn một phương án')
            return
        }

        // Load academic years
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

    // Save schedule (same as ManualSchedule)
    const handleSaveSchedule = async () => {
        if (!selectedSemester) {
            message.warning('Vui lòng chọn học kỳ')
            return
        }

        if (!user || !user.id) {
            message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
            return
        }

        const selectedSchedule = optimizedSchedules[selectedScheduleIndex]

        setSaving(true)
        try {
            // Convert to ScheduleDTO format (same as ManualSchedule)
            const scheduleDTOs = selectedSchedule.scheduleData.map(schedule => ({
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
                parsedPrompt: prompt // Auto schedule has prompt
            }

            await studentAPI.saveSchedule(saveRequest)

            message.success({
                content: 'Đã lưu lịch học thành công!',
                duration: 3
            })

            setSaveModalVisible(false)
            setSelectedAcademicYear(null)
            setSelectedSemester(null)
            setAutoScheduleModalVisible(false)

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

    // Step navigation
    const handleNext = () => {
        if (currentStep === 0 && !prompt.trim()) {
            message.warning('Vui lòng nhập yêu cầu tối ưu hóa')
            return
        }
        if (currentStep === 1) {
            handleOptimize()
            return
        }
        setCurrentStep(currentStep + 1)
    }

    const handlePrev = () => {
        setCurrentStep(currentStep - 1)
    }

    const handleManualSchedule = () => {
        // Pass selected courses to manual schedule page
        navigate('/manual-schedule', { state: { selectedCourses } })
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

    const getChipColor = (index) => {
        const colors = ['course-chip-red', 'course-chip-yellow', 'course-chip-navy']
        return colors[index % colors.length]
    }

    return (
        <div>
            <h1 style={{ color: 'var(--vku-navy)', fontWeight: 700 }}>Chọn Môn Học</h1>

            <Card style={{ marginTop: 24 }} className="vku-card">
                <Tabs items={tabItems} />
            </Card>

            <Card
                style={{ marginTop: 24 }}
                className="vku-card"
            >
                <div className="vku-card-header">
                    <CheckCircleOutlined style={{ fontSize: 24, color: 'var(--vku-red)' }} />
                    <h2 className="vku-card-title">Môn học đã chọn</h2>
                    <span className="vku-badge">{selectedCourses.length}</span>
                    {selectedCourses.length > 0 && (
                        <Button
                            danger
                            size="small"
                            onClick={handleClearAll}
                            style={{ marginLeft: 'auto' }}
                        >
                            Xóa tất cả
                        </Button>
                    )}
                </div>

                {selectedCourses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <CheckCircleOutlined />
                        </div>
                        <div className="empty-state-title">Chưa chọn môn học nào</div>
                        <div className="empty-state-description">
                            Hãy chọn môn học từ danh sách hoặc tìm kiếm ở trên
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            {selectedCourses.map((course, index) => (
                                <span key={course.id} className={`course-chip ${getChipColor(index)}`}>
                                    {formatCourseName(course.courseName, course.subtopic)}
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveCourse(course.id)}
                                        style={{
                                            marginLeft: 8,
                                            color: 'inherit',
                                            minWidth: 'auto',
                                            padding: '0 4px'
                                        }}
                                    />
                                </span>
                            ))}
                        </div>

                        <List
                            dataSource={selectedCourses}
                            renderItem={(course, index) => (
                                <List.Item className="fade-in">
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: index % 3 === 0 ? 'var(--vku-red)' :
                                                    index % 3 === 1 ? 'var(--vku-yellow)' :
                                                        'var(--vku-navy)',
                                                color: index % 3 === 1 ? 'var(--text-dark)' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: 16
                                            }}>
                                                {index + 1}
                                            </div>
                                        }
                                        title={<strong>{course.courseName}</strong>}
                                        description={
                                            <Space wrap>
                                                {course.subtopic && <Tag color="blue">{course.subtopic}</Tag>}
                                                <Tag>Lý thuyết: {course.theoryCredits || 0} TC</Tag>
                                                <Tag>Thực hành: {course.practicalCredits || 0} TC</Tag>
                                                <Tag color="green">Tổng: {course.totalCredits} TC</Tag>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        <div className="action-buttons">
                            <Button
                                type="primary"
                                size="large"
                                icon={<ThunderboltOutlined />}
                                onClick={handleAutoSchedule}
                                className="btn-auto-schedule"
                            >
                                Xếp lịch tự động (NSGA-II)
                            </Button>
                            <Button
                                size="large"
                                icon={<EditOutlined />}
                                onClick={handleManualSchedule}
                                className="btn-manual-schedule"
                            >
                                Xếp lịch thủ công
                            </Button>
                        </div>
                    </>
                )}
            </Card>

            {/* Auto Schedule Modal */}
            <AutoScheduleModal
                visible={autoScheduleModalVisible}
                onCancel={() => {
                    setAutoScheduleModalVisible(false)
                    setCurrentStep(0)
                    setOptimizedSchedules([])
                    setSelectedScheduleIndex(null)
                }}
                currentStep={currentStep}
                onPrev={handlePrev}
                onNext={handleNext}
                selectedCourses={selectedCourses}
                prompt={prompt}
                onPromptChange={setPrompt}
                promptTemplates={promptTemplates}
                onInsertTemplate={insertTemplate}
                weights={weights}
                onWeightChange={handleWeightChange}
                weightConfigs={weightConfigs}
                optimizing={optimizing}
                onOptimize={handleOptimize}
                optimizedSchedules={optimizedSchedules}
                selectedScheduleIndex={selectedScheduleIndex}
                onSelectSchedule={setSelectedScheduleIndex}
                onSave={handleOpenSaveModal}
            />

            {/* Save Schedule Modal */}
            <SaveScheduleModal
                visible={saveModalVisible}
                onCancel={() => {
                    setSaveModalVisible(false)
                    setSelectedAcademicYear(null)
                    setSelectedSemester(null)
                }}
                onConfirm={handleSaveSchedule}
                loading={saving}
                confirmedSchedules={optimizedSchedules[selectedScheduleIndex]?.scheduleData || []}
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

export default SelectCourses
