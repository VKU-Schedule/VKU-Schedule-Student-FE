import { useState } from 'react'
import { Card, Tabs, List, Button, Tag, Space, message, Empty } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import CourseSelector from '../components/Course/CourseSelector'
import CourseSearch from '../components/Course/CourseSearch'

const SelectCourses = () => {
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

    return (
        <div>
            <h1>Chọn Môn Học</h1>

            <Card style={{ marginTop: 24 }}>
                <Tabs items={tabItems} />
            </Card>

            <Card
                title={`Môn học đã chọn (${selectedCourses.length})`}
                style={{ marginTop: 24 }}
                extra={
                    selectedCourses.length > 0 && (
                        <Button danger onClick={handleClearAll}>
                            Xóa tất cả
                        </Button>
                    )
                }
            >
                {selectedCourses.length === 0 ? (
                    <Empty description="Chưa chọn môn học nào" />
                ) : (
                    <List
                        dataSource={selectedCourses}
                        renderItem={(course) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveCourse(course.id)}
                                    >
                                        Xóa
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={course.courseName}
                                    description={
                                        <Space>
                                            {course.subtopic && <Tag color="blue">{course.subtopic}</Tag>}
                                            <Tag>Tổng: {course.totalCredits} TC</Tag>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}

                {selectedCourses.length > 0 && (
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <Space>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => message.info('Chức năng xếp lịch tự động đang phát triển')}
                            >
                                Xếp lịch tự động (NSGA-II)
                            </Button>
                            <Button
                                size="large"
                                onClick={() => window.location.href = '/manual-schedule'}
                            >
                                Xếp lịch thủ công
                            </Button>
                        </Space>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default SelectCourses
