import { Modal, Space, Select } from 'antd'
import { formatCourseName } from '../../utils/courseUtils'

const SaveScheduleModal = ({
    visible,
    onCancel,
    onConfirm,
    loading,
    confirmedSchedules,
    academicYears,
    semesters,
    selectedAcademicYear,
    selectedSemester,
    onAcademicYearChange,
    onSemesterChange
}) => {
    return (
        <Modal
            title="Lưu lịch học"
            open={visible}
            onOk={onConfirm}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Lưu lịch"
            cancelText="Hủy"
            width={500}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                    <p style={{ marginBottom: 8, fontWeight: 500 }}>
                        Bạn đang lưu <strong>{confirmedSchedules.length}</strong> lớp học
                    </p>
                    <p style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
                        Vui lòng chọn học kỳ để lưu lịch học này
                    </p>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                        Năm học <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Select
                        placeholder="Chọn năm học"
                        style={{ width: '100%' }}
                        value={selectedAcademicYear}
                        onChange={onAcademicYearChange}
                        options={academicYears.map(y => ({
                            label: y.yearName,
                            value: y.id
                        }))}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                        Học kỳ <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Select
                        placeholder="Chọn học kỳ"
                        style={{ width: '100%' }}
                        value={selectedSemester}
                        onChange={onSemesterChange}
                        disabled={!selectedAcademicYear}
                        options={semesters.map(s => ({
                            label: s.semesterName,
                            value: s.id
                        }))}
                    />
                </div>

                {confirmedSchedules.length > 0 && (
                    <div style={{
                        marginTop: 16,
                        padding: 12,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        maxHeight: 200,
                        overflowY: 'auto'
                    }}>
                        <p style={{ fontWeight: 500, marginBottom: 8 }}>Danh sách lớp:</p>
                        {confirmedSchedules.map((schedule, index) => (
                            <div key={index} style={{
                                fontSize: 13,
                                marginBottom: 4,
                                padding: '4px 0'
                            }}>
                                • {formatCourseName(schedule.courseName, schedule.subtopic)}
                                {schedule.classNumber && ` (Lớp ${schedule.classNumber})`}
                                <span style={{ color: '#666', marginLeft: 8 }}>
                                    - {schedule.dayOfWeek}, Tiết {schedule.periods}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Space>
        </Modal>
    )
}

export default SaveScheduleModal
