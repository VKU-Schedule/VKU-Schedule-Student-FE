import { useState, useEffect } from 'react'
import { Card, Input, Button, Space, message, List, Tag, Divider } from 'antd'
import { SearchOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons'
import { studentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WeeklyCalendar from '../components/Schedule/WeeklyCalendar'

const { Search } = Input

const ManualSchedule = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [allSchedules, setAllSchedules] = useState([])
    const [selectedSchedules, setSelectedSchedules] = useState([])
    const [searchedCourse, setSearchedCourse] = useState('')

    const handleSearchCourse = async (courseName) => {
        if (!courseName.trim()) {
            message.warning('Vui lòng nhập tên môn học')
            return
        }

        setLoading(true)
        setSearchedCourse(courseName)
        try {
            const response = await studentAPI.getSchedulesByCourse(courseName)
            setAllSchedules(response.data)

            if (response.data.length === 0) {
                message.info('Không tìm thấy lịch học cho môn này')
            }
        } catch (error) {
            message.error('Không thể tải lịch học')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSchedule = (schedule) => {
        // Check if already selected
        const exists = selectedSchedules.find(s => s.id === schedule.id)

        if (exists) {
            // Deselect
            setSelectedSchedules(selectedSchedules.filter(s => s.id !== schedule.id))
            message.info('Đã bỏ chọn lớp')
        } else {
            // Check for conflicts
            const hasConflict = checkConflict(schedule, selectedSchedules)

            if (hasConflict) {
                message.warning('Lớp này bị trùng lịch với lớp đã chọn!')
                return
            }

            setSelectedSchedules([...selectedSchedules, schedule])
            message.success('Đã chọn lớp')
        }
    }

    const checkConflict = (newSchedule, existingSchedules) => {
        // Parse periods
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

    const handleRemoveSchedule = (scheduleId) => {
        setSelectedSchedules(selectedSchedules.filter(s => s.id !== scheduleId))
        message.info('Đã xóa lớp')
    }

    const handleSaveSchedule = async () => {
        if (selectedSchedules.length === 0) {
            message.warning('Chưa chọn lớp nào')
            return
        }

        // TODO: Need to select semester
        message.info('Chức năng lưu lịch đang phát triển. Cần chọn học kỳ trước.')
    }

    return (
        <div>
            <h1>Xếp Lịch Thủ Công</h1>

            <Card style={{ marginTop: 24 }}>
                <Search
                    placeholder="Nhập tên môn học để tìm lịch..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearchCourse}
                    loading={loading}
                />
            </Card>

            {allSchedules.length > 0 && (
                <Card
                    title={`Lịch học môn: ${searchedCourse}`}
                    style={{ marginTop: 24 }}
                >
                    <WeeklyCalendar
                        schedules={allSchedules}
                        selectedSchedules={selectedSchedules}
                        onSelectSchedule={handleSelectSchedule}
                    />
                </Card>
            )}

            <Card
                title={`Lớp đã chọn (${selectedSchedules.length})`}
                style={{ marginTop: 24 }}
                extra={
                    selectedSchedules.length > 0 && (
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSaveSchedule}
                        >
                            Lưu lịch
                        </Button>
                    )
                }
            >
                {selectedSchedules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        Chưa chọn lớp nào. Click vào các ô trong lịch để chọn lớp.
                    </div>
                ) : (
                    <List
                        dataSource={selectedSchedules}
                        renderItem={(schedule) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveSchedule(schedule.id)}
                                    >
                                        Xóa
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
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
                )}
            </Card>
        </div>
    )
}

export default ManualSchedule
