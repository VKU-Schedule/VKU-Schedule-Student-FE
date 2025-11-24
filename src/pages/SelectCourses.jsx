import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tabs, List, Button, Tag, Space, message, Empty } from 'antd'
import { DeleteOutlined, ThunderboltOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons'
import CourseSelector from '../components/Course/CourseSelector'
import CourseSearch from '../components/Course/CourseSearch'

const SelectCourses = () => {
    const navigate = useNavigate()
    const [selectedCourses, setSelectedCourses] = useState([])

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
        message.info('Chức năng xếp lịch tự động (NSGA-II) đang phát triển')
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
                                    {course.courseName}
                                    {course.subtopic && ` - ${course.subtopic}`}
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
        </div>
    )
}

export default SelectCourses
