import { useState } from 'react'
import { Input, List, Card, Tag, Empty, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { searchAPI } from '../../services/api'

const { Search } = Input

const CourseSearch = ({ onCourseSelect }) => {
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState([])
    const [searched, setSearched] = useState(false)

    const handleSearch = async (value) => {
        if (!value.trim()) {
            setResults([])
            setSearched(false)
            return
        }

        setLoading(true)
        setSearched(true)
        try {
            const response = await searchAPI.searchCourses(value)
            setResults(response.data)
        } catch (error) {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelectCourse = (course) => {
        if (onCourseSelect) {
            onCourseSelect({
                id: course.courseId,
                courseName: course.courseName,
                subtopic: course.subtopic,
                theoryCredits: course.theoryCredits,
                practicalCredits: course.practicalCredits,
                totalCredits: course.totalCredits
            })
        }
    }

    return (
        <div>
            <Search
                placeholder="Tìm kiếm môn học theo tên hoặc chủ đề..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                loading={loading}
            />

            <div style={{ marginTop: 16 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : searched && results.length === 0 ? (
                    <Empty description="Không tìm thấy môn học nào" />
                ) : (
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                        dataSource={results}
                        renderItem={(course) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    onClick={() => handleSelectCourse(course)}
                                    style={{ height: '100%' }}
                                >
                                    <Card.Meta
                                        title={course.courseName}
                                        description={
                                            <div>
                                                {course.subtopic && (
                                                    <Tag color="blue" style={{ marginBottom: 8 }}>
                                                        {course.subtopic}
                                                    </Tag>
                                                )}
                                                <div style={{ marginTop: 8 }}>
                                                    <Tag>Lý thuyết: {course.theoryCredits} TC</Tag>
                                                    <Tag>Thực hành: {course.practicalCredits} TC</Tag>
                                                </div>
                                                <div style={{ marginTop: 4 }}>
                                                    <strong>Tổng: {course.totalCredits} tín chỉ</strong>
                                                </div>
                                            </div>
                                        }
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    )
}

export default CourseSearch
