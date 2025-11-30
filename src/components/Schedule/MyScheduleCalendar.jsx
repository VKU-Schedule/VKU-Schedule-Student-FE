import './WeeklyCalendar.css'
import { parsePeriods } from '../../utils/courseUtils'

const MyScheduleCalendar = ({
    schedules,
    failedClasses = []
}) => {

    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']
    const periods = Array.from({ length: 10 }, (_, i) => i + 1)

    // Check if schedule is marked as failed
    const isFailed = (schedule) => {
        return failedClasses.includes(schedule.uniqueKey || schedule.id)
    }

    // Get course color (15 colors for better distribution)
    const getCourseColor = (courseName) => {
        let hash = 0
        for (let i = 0; i < courseName.length; i++) {
            const char = courseName.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return Math.abs(hash) % 15
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
                        const failed = isFailed(schedule)

                        const cellData = {
                            schedule,
                            span,
                            failed,
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

                                const { schedule, span, failed, colorIndex } = cell

                                const classNames = [
                                    'schedule-cell',
                                    `color-${colorIndex}`,
                                    failed ? 'failed' : 'confirmed'
                                ].filter(Boolean).join(' ')

                                return (
                                    <td
                                        key={day}
                                        rowSpan={span}
                                        className={classNames}
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
                                            {failed && (
                                                <div className="conflict-badge">⚠ Lớp lỗi</div>
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

export default MyScheduleCalendar
