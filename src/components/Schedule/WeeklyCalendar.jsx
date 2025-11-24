import './WeeklyCalendar.css'

const WeeklyCalendar = ({
    schedules,
    confirmedSchedules = [],
    currentCourse = null,
    onSelectSchedule
}) => {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    const periods = Array.from({ length: 10 }, (_, i) => i + 1)

    // Parse periods helper
    const parsePeriods = (periodsStr) => {
        try {
            if (typeof periodsStr === 'string') {
                const cleaned = periodsStr.replace(/[\[\]]/g, '')
                return cleaned.split(',').map(p => parseInt(p.trim())).filter(p => p <= 10)
            } else if (Array.isArray(periodsStr)) {
                return periodsStr.filter(p => p <= 10)
            }
            return []
        } catch (e) {
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

    // Check if schedule conflicts
    const hasConflict = (schedule) => {
        if (isConfirmed(schedule.id)) return false
        const schedulePeriods = parsePeriods(schedule.periods)
        const scheduleDay = schedule.dayOfWeek

        for (const confirmed of confirmedSchedules) {
            if (confirmed.dayOfWeek === scheduleDay && confirmed.id !== schedule.id) {
                const confirmedPeriods = parsePeriods(confirmed.periods)
                const overlap = schedulePeriods.some(p => confirmedPeriods.includes(p))
                if (overlap) return true
            }
        }
        return false
    }

    // Get course color
    const getCourseColor = (courseName) => {
        let hash = 0
        for (let i = 0; i < courseName.length; i++) {
            hash = courseName.charCodeAt(i) + ((hash << 5) - hash)
        }
        return Math.abs(hash) % 5
    }

    // Process schedules into grid
    const processSchedules = () => {
        const grid = {}

        // Initialize grid
        days.forEach(day => {
            grid[day] = {}
            periods.forEach(period => {
                grid[day][period] = null
            })
        })

        // Group schedules by day
        const schedulesByDay = {}
        days.forEach(day => {
            schedulesByDay[day] = schedules.filter(s => s.dayOfWeek === day)
        })

        // Place schedules in grid
        days.forEach(day => {
            const daySchedules = schedulesByDay[day]

            daySchedules.forEach(schedule => {
                const periodList = parsePeriods(schedule.periods).sort((a, b) => a - b)
                if (periodList.length === 0) return

                // Find consecutive ranges
                const ranges = []
                let start = periodList[0]
                let end = periodList[0]

                for (let i = 1; i < periodList.length; i++) {
                    if (periodList[i] === end + 1) {
                        end = periodList[i]
                    } else {
                        ranges.push({ start, end })
                        start = periodList[i]
                        end = periodList[i]
                    }
                }
                ranges.push({ start, end })

                // Place each range in grid
                ranges.forEach(range => {
                    const startPeriod = range.start
                    const span = range.end - range.start + 1

                    // Check if slot is available
                    let canPlace = true
                    for (let p = startPeriod; p <= range.end; p++) {
                        if (grid[day][p] !== null) {
                            canPlace = false
                            break
                        }
                    }

                    if (canPlace) {
                        const confirmed = isConfirmed(schedule.id)
                        const current = isCurrentCourse(schedule)
                        const conflict = hasConflict(schedule)

                        const cellData = {
                            schedule,
                            span,
                            confirmed,
                            current,
                            conflict,
                            colorIndex: getCourseColor(schedule.courseName)
                        }

                        grid[day][startPeriod] = cellData

                        // Mark other cells as occupied
                        for (let p = startPeriod + 1; p <= range.end; p++) {
                            grid[day][p] = 'occupied'
                        }
                    }
                })
            })
        })

        return grid
    }

    const grid = processSchedules()

    if (schedules.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-title">Chưa có lịch học nào</div>
                <div className="empty-state-description">Chọn môn học để xem lịch học</div>
            </div>
        )
    }

    return (
        <div className="weekly-calendar">
            <table className="calendar-table">
                <thead>
                    <tr>
                        <th className="period-header">TIẾT</th>
                        {days.map(day => (
                            <th key={day} className="day-header">
                                <div className="day-name">{day.toUpperCase()}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {periods.map(period => (
                        <tr key={period}>
                            <td className="period-cell">
                                <div className="period-number">{period}</div>
                            </td>
                            {days.map(day => {
                                const cell = grid[day][period]

                                if (cell === 'occupied') {
                                    return null
                                }

                                if (cell === null) {
                                    return (
                                        <td key={day} className="empty-cell">
                                            <div className="cell-content"></div>
                                        </td>
                                    )
                                }

                                const { schedule, span, confirmed, current, conflict, colorIndex } = cell

                                const classNames = [
                                    'schedule-cell',
                                    `color-${colorIndex}`,
                                    confirmed ? 'confirmed' : 'preview',
                                    conflict ? 'conflict' : ''
                                ].filter(Boolean).join(' ')

                                return (
                                    <td
                                        key={day}
                                        rowSpan={span}
                                        className={classNames}
                                        onClick={() => onSelectSchedule && onSelectSchedule(schedule)}
                                        style={{ cursor: onSelectSchedule ? 'pointer' : 'default' }}
                                    >
                                        <div className="cell-content">
                                            <div className="course-name">{schedule.courseName}</div>
                                            {schedule.classNumber && (
                                                <div className="class-info">({schedule.classNumber})</div>
                                            )}
                                            <div className="room-info">
                                                {schedule.location}.{schedule.roomNumber}
                                            </div>
                                            {schedule.instructor && (
                                                <div className="instructor-info">{schedule.instructor}</div>
                                            )}
                                            {conflict && (
                                                <div className="conflict-badge">⚠ Trùng lịch</div>
                                            )}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default WeeklyCalendar
