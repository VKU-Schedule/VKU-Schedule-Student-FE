import { Modal, Button, Space, Steps, Tag, Row, Col, Card, Slider, Spin, List, Input } from 'antd'
import { ThunderboltOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons'
import MyScheduleCalendar from './MyScheduleCalendar'
import { formatCourseName } from '../../utils/courseUtils'

const { Step } = Steps
const { TextArea } = Input

const AutoScheduleModal = ({
    visible,
    onCancel,
    currentStep,
    onPrev,
    onNext,
    selectedCourses,
    prompt,
    onPromptChange,
    promptTemplates,
    onInsertTemplate,
    weights,
    onWeightChange,
    weightConfigs,
    optimizing,
    onOptimize,
    optimizedSchedules,
    selectedScheduleIndex,
    onSelectSchedule,
    onSave
}) => {
    const renderPreferences = () => (
        <div>
            <div style={{ marginBottom: 16 }}>
                <strong>Môn học đã chọn ({selectedCourses.length}):</strong>
                <div style={{ marginTop: 8 }}>
                    <Space wrap>
                        {selectedCourses.map((course) => (
                            <Tag key={course.id} color="blue">
                                {formatCourseName(course.courseName, course.subtopic)}
                            </Tag>
                        ))}
                    </Space>
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <strong>Mẫu gợi ý:</strong>
                <div style={{ marginTop: 8 }}>
                    <Space wrap>
                        {promptTemplates.map((template, index) => (
                            <Tag
                                key={index}
                                color="gold"
                                style={{ cursor: 'pointer' }}
                                onClick={() => onInsertTemplate(template.text)}
                            >
                                {template.label}
                            </Tag>
                        ))}
                    </Space>
                </div>
            </div>

            <TextArea
                rows={8}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder="Ví dụ: Tôi thích học buổi sáng, không học thứ sáu, tránh các giảng viên Nguyễn Văn A..."
                maxLength={500}
                showCount
            />

            <div style={{ marginTop: 16, color: '#666', fontSize: 13 }}>
                💡 Mô tả sở thích của bạn bằng tiếng Việt tự nhiên
            </div>
        </div>
    )

    const renderWeights = () => (
        <div>
            <div style={{ marginBottom: 16, color: '#666' }}>
                Điều chỉnh trọng số cho các tiêu chí (1-6, càng cao càng quan trọng)
            </div>

            <Row gutter={[16, 16]}>
                {weightConfigs.map(config => (
                    <Col span={24} key={config.key}>
                        <Card size="small">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 24, marginRight: 12 }}>{config.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{config.label}</div>
                                    <div style={{ fontSize: 12, color: '#666' }}>{config.description}</div>
                                </div>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: 'linear-gradient(135deg, #d32f2f 0%, #f57c00 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: 18
                                }}>
                                    {weights[config.key]}
                                </div>
                            </div>
                            <Slider
                                min={1}
                                max={6}
                                marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }}
                                value={weights[config.key]}
                                onChange={(value) => onWeightChange(config.key, value)}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    )

    const renderOptimizing = () => (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 24, fontSize: 18, fontWeight: 600 }}>
                Đang tối ưu hóa lịch học với thuật toán NSGA-II...
            </div>
            <div style={{ marginTop: 8, color: '#666' }}>
                Quá trình này có thể mất 30-60 giây
            </div>
            <div style={{ marginTop: 16, color: '#999', fontSize: 13 }}>
                💡 Thuật toán đang phân tích {selectedCourses.length} môn học và tìm phương án tối ưu nhất
            </div>
        </div>
    )

    const renderResults = () => (
        <div>
            <div style={{ marginBottom: 16 }}>
                <strong>Tìm thấy {optimizedSchedules.length} phương án tối ưu</strong>
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                <List
                    dataSource={optimizedSchedules}
                    renderItem={(schedule, index) => (
                        <List.Item
                            style={{
                                cursor: 'pointer',
                                background: selectedScheduleIndex === index ? '#e6f7ff' : 'transparent',
                                padding: 16,
                                borderRadius: 8,
                                marginBottom: 8,
                                border: selectedScheduleIndex === index ? '2px solid #1890ff' : '1px solid #f0f0f0'
                            }}
                            onClick={() => onSelectSchedule(index)}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <span>Phương án {index + 1}</span>
                                        <Tag color="blue">Score: {schedule.score.toFixed(2)}</Tag>
                                        {selectedScheduleIndex === index && (
                                            <Tag color="success" icon={<CheckCircleOutlined />}>Đã chọn</Tag>
                                        )}
                                    </Space>
                                }
                                description={
                                    <Space split="|">
                                        <span>{schedule.totalClasses} lớp học</span>
                                        <span>{schedule.daysPerWeek} ngày/tuần</span>
                                        <span>{schedule.subjects.length} môn</span>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>

            {selectedScheduleIndex !== null && (
                <div>
                    <strong style={{ display: 'block', marginBottom: 8 }}>Xem trước lịch học:</strong>
                    <MyScheduleCalendar
                        schedules={optimizedSchedules[selectedScheduleIndex].scheduleData}
                        failedClasses={[]}
                    />
                </div>
            )}
        </div>
    )

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderPreferences()
            case 1:
                return renderWeights()
            case 2:
                return renderOptimizing()
            case 3:
                return renderResults()
            default:
                return null
        }
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
            width={1000}
            footer={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onPrev}
                        disabled={currentStep === 0 || currentStep === 2}
                    >
                        Quay lại
                    </Button>

                    <Space>
                        {currentStep < 1 && (
                            <Button
                                type="primary"
                                icon={<ArrowRightOutlined />}
                                onClick={onNext}
                            >
                                Tiếp theo
                            </Button>
                        )}

                        {currentStep === 1 && (
                            <Button
                                type="primary"
                                danger
                                icon={<ThunderboltOutlined />}
                                onClick={onOptimize}
                                loading={optimizing}
                            >
                                Bắt đầu tối ưu
                            </Button>
                        )}

                        {currentStep === 3 && (
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={onSave}
                                disabled={selectedScheduleIndex === null}
                            >
                                Lưu lịch học
                            </Button>
                        )}
                    </Space>
                </Space>
            }
        >
            <Steps current={currentStep} style={{ marginBottom: 24 }}>
                <Step title="Nhập sở thích" />
                <Step title="Cấu hình trọng số" />
                <Step title="Tối ưu hóa" />
                <Step title="Kết quả" />
            </Steps>

            {renderStepContent()}
        </Modal>
    )
}

export default AutoScheduleModal
