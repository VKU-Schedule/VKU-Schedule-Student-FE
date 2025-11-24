import { Table, Card, Tag } from 'antd'
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons'

const WeeklyCalendar = ({
    schedules,
    confirmedSchedules = [],
    currentCourse = null,
    onSelectSchedule
}) => {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    const periods = Array.from({ length: 13 }, (_, i) => i + 1)

    // Parse periods helper
    const parsePeriods = (periodsStr) => {
        try {
            if (typeof periodsStr === 'string') {
                const cleaned = periodsStr.replace(/[\[\]]/g, '')
                return cleaned.split(',').map(p => parseInt(p.trim()))
            } else if (Array.isArray(periodsStr)) {
                return periodsStr
            }
            return []
        } catch (e) {
            console.error('Error parsing periods:', e)
            return []
        }
    }

    // Check if schedule is confirmed
    const isConfirmed = (scheduleId) => {
        return confirmedSchedules.some(s => s.id === scheduleId)
    }

    // Check if schedule is from current course
    const isCurrentCourse = (schedule) => {
        return currentCourse && schedule.courseName === currentCourse.courseName
    }

    // Check if schedule conflicts with confirmed schedules
    const hasConflict = (schedule) => {
        if (isConfirmed(schedule.id)) return false

        const schedulePeriods = parsePeriods(schedule.periods)
        const scheduleDay = schedule.dayOfWeek

        for (const confirmed of confirmedSchedules) {
            if (confirmed.dayOfWeek === scheduleDay && confirmed.id !== schedule.id) {
                const confirmedPeriods = parsePeriods(confirmed.periods)
                const overlap = schedulePeriods.some(p => confirmedPeriods.includes(p))
                if (overlap) {
                    return true
                }
            }
        }

        return false
    }

    // Get card class based on status
    const getCardClass = (schedule) => {
        const classes = ['schedule-card']

        if (isConfirmed(schedule.id)) {
            classes.push('confirmed')
        } else if (isCurrentCourse(schedule)) {
            if (hasConflict(schedule)) {
                classes.push('conflict')
            } else {
                classes.push('preview')
            }
        } else {
            // Other courses - very light preview
            classes.push('preview')
        }

        return classes.join(' ')
    }

    // Group schedules by day and period
    const groupSchedules = () => {
        const grouped = {}

        schedules.forEach(schedule => {
            const day = schedule.dayOfWeek
            if (!day) return

            const periodList = parsePeriods(schedule.periods)

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

    const columns = [
        {
            title: 'Tiết',
            dataIndex: 'period',
            key: 'period',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (period) => (
                <div style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--vku-navy)'
                }}>
                    {period}
                </div>
            )
        },
        ...days.map(day => ({
            title: (
                <div style={{
                    fontWeight: 700,
                    color: 'var(--vku-navy)',
                    fontSize: 14
                }}>
                    {day}
                </div>
            ),
            dataIndex: day,
            key: day,
            width: 180,
            render: (_, record) => {
                const key = `${day}-${record.period}`
                const daySchedules = groupedSchedules[key] || []

                if (daySchedules.length === 0) {
                    return <div className="calendar-cell calendar-cell-empty" />
                }

                // Sort: confirmed first, then current course, then others
                const sortedSchedules = [...daySchedules].sort((a, b) => {
                    const aConfirmed = isConfirmed(a.id)
                    const bConfirmed = isConfirmed(b.id)
                    const aCurrent = isCurrentCourse(a)
                    const bCurrent = isCurrentCourse(b)

                    if (aConfirmed && !bConfirmed) return -1
                    if (!aConfirmed && bConfirmed) return 1
                    if (aCurrent && !bCurrent) return -1
                    if (!aCurrent && bCurrent) return 1
                    return 0
                })

                return (
                    <div className="calendar-cell">
                        {sortedSchedules.map(schedule => {
                            const confirmed = isConfirmed(schedule.id)
                            const conflict = hasConflict(schedule)
                            const current = isCurrentCourse(schedule)

                            return (
                                <Card
                                    key={schedule.id}
                                    size="small"
                                    className={getCardClass(schedule)}
                                    onClick={() => onSelectSchedule && onSelectSchedule(schedule)}
                                    style={{
                                        marginBottom: 4,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        fontSize: 12,
                                        fontWeight: confirmed ? 700 : 600,
                                        marginBottom: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        {confirmed && (
                                            <CheckCircleOutlined style={{ color: 'var(--vku-red)' }} />
                                        )}
                                        {conflict && (
                                            <WarningOutlined style={{ color: '#ff9800' }} />
                                        )}
                                        <span>{schedule.courseName}</span>
                                    </div>

                                    {schedule.classNumber && (
                                        <Tag
                                            size="small"
                                            color={confirmed ? "red" : current ? "gold" : "default"}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Lớp {schedule.classNumber}
                                        </Tag>
                                    )}

                                    <div style={{
                                        fontSize: 11,
                                        color: confirmed ? 'var(--text-dark)' : '#666',
                                        marginTop: 4
                                    }}>
                                        {schedule.instructor}
                                    </div>

                                    <div style={{
                                        fontSize: 11,
                                        color: confirmed ? 'var(--text-medium)' : '#999'
                                    }}>
                                        {schedule.location}.{schedule.roomNumber}
                                    </div>

                                    {schedule.classGroup && (
                                        <div style={{
                                            fontSize: 10,
                                            color: '#999',
                                            marginTop: 2
                                        }}>
                                            {schedule.classGroup}
                                        </div>
                                    )}

                                    {conflict && (
                                        <Tag
                                            size="small"
                                            color="warning"
                                            style={{ marginTop: 4 }}
                                        >
                                            Trùng lịch
                                        </Tag>
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
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <CheckCircleOutlined />
                </div>
                <div className="empty-state-title">Chưa có lịch học nào</div>
                <div className="empty-state-description">
                    Chọn môn học để xem lịch học
                </div>
            </div>
        )
    }

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 1400 }}
            bordered
            size="small"
            className="vku-calendar-table"
        />
    )
}

export default WeeklyCalendar
