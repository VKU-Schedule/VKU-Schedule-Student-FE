import { Modal, Button, Space, Alert, Input, Tag, List, Card, Empty, Spin } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import MyScheduleCalendar from './MyScheduleCalendar'

const OptimizationModal = ({
    visible,
    onCancel,
    optimizing,
    optimizedSchedules,
    selectedOptimizedSchedule,
    onSelectOptimizedSchedule,
    onApplyOptimizedSchedule,
    onOptimize,
    optimizationPrompt,
    onPromptChange,
    failedClasses,
    selectedSchedule
}) => {
    const getFooter = () => {
        if (optimizedSchedules.length > 0) {
            return [
                <Button key="back" onClick={() => onSelectOptimizedSchedule(null)}>
                    Tối ưu lại
                </Button>,
                <Button
                    key="apply"
                    type="primary"
                    onClick={onApplyOptimizedSchedule}
                    disabled={!selectedOptimizedSchedule}
                >
                    Áp dụng lịch này
                </Button>
            ]
        }

        return [
            <Button key="cancel" onClick={onCancel}>
                Hủy
            </Button>,
            <Button
                key="optimize"
                type="primary"
                danger
                icon={<ThunderboltOutlined />}
                onClick={onOptimize}
                loading={optimizing}
            >
                Bắt đầu tối ưu
            </Button>
        ]
    }

    return (
        <Modal
            title={
                <Space>
                    <ThunderboltOutlined style={{ color: '#ff4d4f' }} />
                    <span>Xếp lịch tự động với NSGA-II</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            width={1400}
            footer={getFooter()}
        >
            {optimizing ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, fontSize: 16 }}>
                        Đang tối ưu hóa lịch học với thuật toán NSGA-II...
                    </div>
                    <div style={{ marginTop: 8, color: '#666' }}>
                        Quá trình này có thể mất 30-60 giây
                    </div>
                </div>
            ) : optimizedSchedules.length > 0 ? (
                <div>
                    <Alert
                        message={`Tìm thấy ${optimizedSchedules.length} phương án tối ưu`}
                        description="Chọn một phương án để xem chi tiết và áp dụng vào lịch học của bạn"
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 350, flexShrink: 0 }}>
                            <Card size="small" title="Các phương án">
                                <List
                                    dataSource={optimizedSchedules}
                                    renderItem={(schedule, index) => (
                                        <List.Item
                                            style={{
                                                cursor: 'pointer',
                                                background: selectedOptimizedSchedule?.id === schedule.id ? '#e6f7ff' : 'transparent',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                border: selectedOptimizedSchedule?.id === schedule.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
                                            }}
                                            onClick={() => onSelectOptimizedSchedule(schedule)}
                                        >
                                            <List.Item.Meta
                                                title={
                                                    <Space>
                                                        <span>Phương án {index + 1}</span>
                                                        <Tag color="blue">Score: {schedule.score.toFixed(2)}</Tag>
                                                    </Space>
                                                }
                                                description={
                                                    <div style={{ fontSize: 12 }}>
                                                        <div>{schedule.scheduleData.length} lớp học</div>
                                                        <div>
                                                            {[...new Set(schedule.scheduleData.map(s => s.dayOfWeek))].length} ngày/tuần
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </div>

                        <div style={{ flex: 1 }}>
                            {selectedOptimizedSchedule ? (
                                <Card size="small" title="Xem trước lịch">
                                    <Alert
                                        message="Lịch hoàn chỉnh"
                                        description="Bao gồm các lớp thành công + lớp được tối ưu"
                                        type="info"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                    <MyScheduleCalendar
                                        schedules={[
                                            ...selectedSchedule.scheduleData.filter(s => !failedClasses.includes(s.uniqueKey)),
                                            ...selectedOptimizedSchedule.scheduleData
                                        ]}
                                        failedClasses={[]}
                                    />
                                </Card>
                            ) : (
                                <Card size="small">
                                    <Empty description="Chọn một phương án để xem chi tiết" />
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <Alert
                        message="Nhập yêu cầu tối ưu hóa"
                        description="Mô tả các tiêu chí bạn muốn tối ưu (ví dụ: ít ngày học nhất, tránh học sáng sớm, tập trung vào buổi chiều...)"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <div style={{ marginBottom: 16 }}>
                        <strong>Các lớp cần xếp lại:</strong>
                        <div style={{ marginTop: 8 }}>
                            {selectedSchedule?.scheduleData
                                .filter(s => failedClasses.includes(s.uniqueKey))
                                .map(cls => (
                                    <Tag key={cls.uniqueKey} color="error" style={{ marginBottom: 4 }}>
                                        {cls.courseName} - Lớp {cls.classNumber}
                                    </Tag>
                                ))}
                        </div>
                    </div>

                    <div>
                        <strong>Yêu cầu tối ưu hóa:</strong>
                        <Input.TextArea
                            value={optimizationPrompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            placeholder="Ví dụ: Tối ưu hóa lịch học với ít ngày học nhất, tránh trùng lịch, ưu tiên học buổi chiều"
                            rows={4}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default OptimizationModal
