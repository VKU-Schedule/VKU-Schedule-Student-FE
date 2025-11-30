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
                                description="Chọn lớp thay thế cho từng môn bị lỗi. Lịch bên phải sẽ cập nhật theo lựa chọn của bạn."
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
                                                            onSelectReplacement(failedClass.uniqueKey, selected)
                                                        }}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            {replacementClasses[failedClass.courseName]?.map(replacement => (
                                                                <Radio key={replacement.id} value={replacement.id}>
                                                                    <Space direction="vertical" size="small">
                                                                        <div>
                                                                            <Tag color="blue">Lớp {replacement.classNumber}</Tag>
                                                                            <Tag>{replacement.dayOfWeek}</Tag>
                                                                            <Tag>Tiết {replacement.periods}</Tag>
                                                                        </div>
                                                                        <div style={{ fontSize: 12, color: '#666' }}>
                                                                            {replacement.location}.{replacement.roomNumber} - {replacement.instructor}
                                                                        </div>
                                                                    </Space>
                                                                </Radio>
                                                            ))}
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
