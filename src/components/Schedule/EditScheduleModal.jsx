import { Modal, Button, Space, Alert, Card, Checkbox, Tag, Collapse, Radio } from 'antd'
import { WarningOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import MyScheduleCalendar from './MyScheduleCalendar'
import WeeklyCalendar from './WeeklyCalendar'

const { Panel } = Collapse

const EditScheduleModal = ({
    visible,
    onCancel,
    selectedSchedule,
    failedClasses,
    onToggleFailedClass,
    showReplacements,
    onShowReplacements,
    onBackToSelection,
    replacementClasses,
    selectedReplacements,
    onSelectReplacement,
    onSaveNewSchedule,
    loadingReplacements,
    onAutoReschedule,
    previewSchedule
}) => {
    // Helper function to check if a replacement conflicts with existing schedule
    const hasConflict = (replacement, failedClassKey) => {
        if (!selectedSchedule) return false

        // Get all schedules except the failed one being replaced
        const otherSchedules = selectedSchedule.scheduleData.filter(
            s => s.uniqueKey !== failedClassKey && !failedClasses.includes(s.uniqueKey)
        )

        // Add already selected replacements (except for current failed class)
        const selectedReplacementsList = Object.entries(selectedReplacements)
            .filter(([key, value]) => key !== failedClassKey && value)
            .map(([_, value]) => value)

        const allSchedules = [...otherSchedules, ...selectedReplacementsList]

        // Parse replacement periods - handle both "[6, 7]" and "6,7" formats
        let replacementPeriods = []
        if (typeof replacement.periods === 'string') {
            // Try to parse as JSON array first (e.g., "[6, 7]")
            try {
                const parsed = JSON.parse(replacement.periods)
                replacementPeriods = Array.isArray(parsed) ? parsed : []
            } catch {
                // Fall back to comma-separated (e.g., "6,7")
                replacementPeriods = replacement.periods.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
            }
        } else if (Array.isArray(replacement.periods)) {
            replacementPeriods = replacement.periods
        }

        console.log('=== Checking conflict for ===')
        console.log('Replacement:', {
            course: replacement.courseName,
            class: replacement.classNumber,
            day: replacement.dayOfWeek,
            periods: replacement.periods,
            periodsType: typeof replacement.periods,
            parsedPeriods: replacementPeriods
        })
        console.log('Failed class key:', failedClassKey)
        console.log('All schedules to check:', allSchedules.length)

        // Check for conflicts
        const conflict = allSchedules.some(schedule => {
            console.log('  Checking against schedule:', {
                course: schedule.courseName,
                class: schedule.classNumber,
                day: schedule.dayOfWeek,
                periods: schedule.periods,
                periodsType: typeof schedule.periods
            })

            // Same day?
            if (schedule.dayOfWeek !== replacement.dayOfWeek) {
                console.log('    → Different day, no conflict')
                return false
            }

            // Parse schedule periods - handle both "[6, 7]" and "6,7" formats
            let schedulePeriods = []
            if (typeof schedule.periods === 'string') {
                // Try to parse as JSON array first (e.g., "[6, 7]")
                try {
                    const parsed = JSON.parse(schedule.periods)
                    schedulePeriods = Array.isArray(parsed) ? parsed : []
                } catch {
                    // Fall back to comma-separated (e.g., "6,7")
                    schedulePeriods = schedule.periods.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
                }
            } else if (Array.isArray(schedule.periods)) {
                schedulePeriods = schedule.periods
            }

            console.log('    → Same day! Checking periods:', {
                schedulePeriods,
                replacementPeriods
            })

            // Check if periods overlap
            const hasOverlap = replacementPeriods.some(p => schedulePeriods.includes(p))

            console.log('    → Overlap result:', hasOverlap)

            if (hasOverlap) {
                console.log('    ✗ CONFLICT FOUND!')
            }

            return hasOverlap
        })

        console.log('=== Final conflict result:', conflict, '===\n')
        return conflict
    }

    // Check if replacement is the same as the failed class
    const isSameAsFailedClass = (replacement, failedClassKey) => {
        const failedClass = selectedSchedule?.scheduleData.find(s => s.uniqueKey === failedClassKey)
        if (!failedClass) return false

        return failedClass.id === replacement.id ||
            (failedClass.courseName === replacement.courseName &&
                failedClass.classNumber === replacement.classNumber &&
                failedClass.dayOfWeek === replacement.dayOfWeek &&
                failedClass.periods === replacement.periods)
    }

    const getFooter = () => {
        if (showReplacements) {
            return [
                <Button key="back" onClick={onBackToSelection}>
                    Quay lại
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    onClick={onSaveNewSchedule}
                    disabled={!failedClasses.every(key => selectedReplacements[key])}
                >
                    Lưu lịch mới
                </Button>
            ]
        }

        return [
            <Button key="close" onClick={onCancel}>
                Đóng
            </Button>,
            failedClasses.length > 0 && (
                <Button
                    key="manual"
                    type="default"
                    icon={<CheckCircleOutlined />}
                    onClick={onShowReplacements}
                    loading={loadingReplacements}
                >
                    Chọn lớp thay thế
                </Button>
            ),
            failedClasses.length > 0 && (
                <Button
                    key="auto"
                    type="primary"
                    danger
                    icon={<ThunderboltOutlined />}
                    onClick={onAutoReschedule}
                >
                    Xếp tự động (NSGA-II)
                </Button>
            )
        ]
    }

    return (
        <Modal
            title={
                <Space>
                    <span>Sửa lỗi đăng ký - {selectedSchedule?.semesterName}</span>
                    {failedClasses.length > 0 && (
                        <Tag color="error">{failedClasses.length} lớp bị lỗi</Tag>
                    )}
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            width={1400}
            footer={getFooter()}
        >
            {selectedSchedule && (
                <div>
                    {!showReplacements ? (
                        <>
                            <Alert
                                message="Đánh dấu lớp bị lỗi đăng ký"
                                description="Click vào các lớp bị lỗi khi đăng ký (lớp đầy, trùng lịch, v.v.) để đánh dấu. Sau đó chọn cách xếp lại."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <Card size="small" style={{ marginBottom: 16 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Chọn lớp bị lỗi:</strong>
                                </div>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {selectedSchedule.scheduleData.map(schedule => (
                                        <Checkbox
                                            key={schedule.uniqueKey}
                                            checked={failedClasses.includes(schedule.uniqueKey)}
                                            onChange={() => onToggleFailedClass(schedule.uniqueKey)}
                                        >
                                            <Space>
                                                <Tag color={failedClasses.includes(schedule.uniqueKey) ? 'error' : 'default'}>
                                                    {schedule.courseName}
                                                </Tag>
                                                <span>Lớp {schedule.classNumber}</span>
                                                <span>-</span>
                                                <span>{schedule.dayOfWeek}, Tiết {schedule.periods}</span>
                                            </Space>
                                        </Checkbox>
                                    ))}
                                </Space>
                            </Card>

                            <MyScheduleCalendar
                                schedules={selectedSchedule.scheduleData}
                                failedClasses={failedClasses}
                            />
                        </>
                    ) : (
                        <>
                            <Alert
                                message="Chọn lớp thay thế"
                                description="Chọn lớp thay thế cho từng môn bị lỗi. Các lớp bị trùng lịch hoặc lớp đang bị lỗi sẽ bị vô hiệu hóa. Lịch bên phải sẽ cập nhật theo lựa chọn của bạn."
                                type="success"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ flex: 1, maxHeight: 600, overflowY: 'auto' }}>
                                    <Collapse defaultActiveKey={Object.keys(replacementClasses)}>
                                        {selectedSchedule.scheduleData
                                            .filter(s => failedClasses.includes(s.uniqueKey))
                                            .map(failedClass => (
                                                <Panel
                                                    header={
                                                        <Space>
                                                            <WarningOutlined style={{ color: '#ff4d4f' }} />
                                                            <strong>{failedClass.courseName}</strong>
                                                            <Tag color="error">Lớp {failedClass.classNumber} (Bị lỗi)</Tag>
                                                            {selectedReplacements[failedClass.uniqueKey] && (
                                                                <Tag color="success">
                                                                    → Lớp {selectedReplacements[failedClass.uniqueKey].classNumber}
                                                                </Tag>
                                                            )}
                                                        </Space>
                                                    }
                                                    key={failedClass.uniqueKey}
                                                >
                                                    <Radio.Group
                                                        value={selectedReplacements[failedClass.uniqueKey]?.id}
                                                        onChange={(e) => {
                                                            const selected = replacementClasses[failedClass.courseName]?.find(
                                                                r => r.id === e.target.value
                                                            )

                                                            // Double check (shouldn't happen due to disabled, but just in case)
                                                            if (selected) {
                                                                const hasTimeConflict = hasConflict(selected, failedClass.uniqueKey)
                                                                const isSameClass = isSameAsFailedClass(selected, failedClass.uniqueKey)

                                                                if (isSameClass) {
                                                                    // This shouldn't happen, but handle it gracefully
                                                                    return
                                                                }

                                                                if (hasTimeConflict) {
                                                                    // This shouldn't happen, but handle it gracefully
                                                                    return
                                                                }
                                                            }

                                                            onSelectReplacement(failedClass.uniqueKey, selected)
                                                        }}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            {replacementClasses[failedClass.courseName]?.map(replacement => {
                                                                const hasTimeConflict = hasConflict(replacement, failedClass.uniqueKey)
                                                                const isSameClass = isSameAsFailedClass(replacement, failedClass.uniqueKey)
                                                                const isDisabled = hasTimeConflict || isSameClass

                                                                return (
                                                                    <Radio
                                                                        key={replacement.id}
                                                                        value={replacement.id}
                                                                        disabled={isDisabled}
                                                                    >
                                                                        <Space direction="vertical" size="small">
                                                                            <div>
                                                                                <Tag color="blue">Lớp {replacement.classNumber}</Tag>
                                                                                <Tag>{replacement.dayOfWeek}</Tag>
                                                                                <Tag>Tiết {replacement.periods}</Tag>
                                                                                {isSameClass && (
                                                                                    <Tag color="warning">Lớp đang bị lỗi</Tag>
                                                                                )}
                                                                                {hasTimeConflict && !isSameClass && (
                                                                                    <Tag color="error">Trùng lịch</Tag>
                                                                                )}
                                                                            </div>
                                                                            <div style={{ fontSize: 12, color: isDisabled ? '#999' : '#666' }}>
                                                                                {replacement.location}.{replacement.roomNumber} - {replacement.instructor}
                                                                            </div>
                                                                        </Space>
                                                                    </Radio>
                                                                )
                                                            })}
                                                        </Space>
                                                    </Radio.Group>
                                                </Panel>
                                            ))}
                                    </Collapse>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <Card size="small" title="Xem trước lịch mới">
                                        <WeeklyCalendar
                                            schedules={previewSchedule}
                                            confirmedSchedules={previewSchedule}
                                            onSelectSchedule={null}
                                        />
                                    </Card>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </Modal>
    )
}

export default EditScheduleModal
