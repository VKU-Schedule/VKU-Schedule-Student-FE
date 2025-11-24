import { Table, Card, Tag, Empty } from 'antd'

const WeeklyCalendar = ({ schedules, selectedSchedules, onSelectSchedule }) => {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    const periods = Array.from({ length: 13 }, (_, i) => i + 1)

    // Group schedules by day and period
    const groupSchedules = () => {
        const grouped = {}

        schedules.forEach(schedule => {
            const day = schedule.dayOfWeek
            if (!day) return

            // Parse periods - could be string like "[1, 2, 3]" or "1,2,3"
            let periodList = []
            try {
                if (typeof schedule.periods === 'string') {
                    const cleaned = schedule.periods.replace(/[\[\]]/g, '')
                    periodList = cleaned.split(',').map(p => parseInt(p.trim()))
                } else if (Array.isArray(schedule.periods)) {
                    periodList = schedule.periods
                }
            } catch (e) {
                console.error('Error parsing periods:', e)
            }

            periodList.forEach(period => {
                const key = `${day}-${period}`
                if (!grouped[key]) {
                    grouped[key] = []
                }
                grouped[key].push(schedule)
            })
        })

        return grouped
    }

    const groupedSchedules = groupSchedules()

    const isSelected = (scheduleId) => {
        return selectedSchedules.some(s => s.id === scheduleId)
    }

    const columns = [
        {
            title: 'Tiết',
            dataIndex: 'period',
            key: 'period',
            fixed: 'left',
            width: 60,
            align: 'center'
        },
        ...days.map(day => ({
            title: day,
            dataIndex: day,
            key: day,
            width: 180,
            render: (_, record) => {
                const key = `${day}-${record.period}`
                const daySchedules = groupedSchedules[key] || []

                if (daySchedules.length === 0) {
                    return <div className="calendar-cell calendar-cell-empty" />
                }

                return (
                    <div className="calendar-cell">
                        {daySchedules.map(schedule => {
                            const selected = isSelected(schedule.id)
                            return (
                                <Card
                                    key={schedule.id}
                                    size="small"
                                    className={`schedule-card ${selected ? 'selected' : ''}`}
                                    onClick={() => onSelectSchedule(schedule)}
                                    style={{ marginBottom: 4 }}
                                >
                                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                                        {schedule.courseName}
                                    </div>
                                    {schedule.classNumber && (
                                        <Tag size="small" color="blue">Lớp {schedule.classNumber}</Tag>
                                    )}
                                    <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                                        {schedule.instructor}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#999' }}>
                                        {schedule.location}.{schedule.roomNumber}
                                    </div>
                                    {schedule.classGroup && (
                                        <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                                            {schedule.classGroup}
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                )
            }
        }))
    ]

    const dataSource = periods.map(period => ({
        key: period,
        period
    }))

    if (schedules.length === 0) {
        return <Empty description="Chưa có lịch học nào" />
    }

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 1400 }}
            bordered
            size="small"
        />
    )
}

export default WeeklyCalendar
