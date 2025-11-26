# Tính Năng Xếp Lại Lịch Khi Đăng Ký Thất Bại

## Tổng Quan

Tính năng cho phép sinh viên xếp lại lịch khi một số lớp đăng ký thất bại (lớp đầy, trùng lịch, v.v.)

## User Flow

### Scenario: Đăng ký 5 lớp, 2 lớp thất bại

```
1. Sinh viên có lịch đã lưu với 5 lớp
   ├─ Lớp A1 ✓
   ├─ Lớp B2 ✓
   ├─ Lớp C3 ✓
   ├─ Lớp D4 ✗ (Thất bại)
   └─ Lớp E5 ✗ (Thất bại)

2. Sinh viên vào "Lịch của tôi"
   → Click "Xem" lịch đó

3. Đánh dấu lớp bị lỗi
   → Checkbox: Lớp D4 ✓
   → Checkbox: Lớp E5 ✓

4. Click "Xếp lại lịch (2 lớp)"
   → Modal hiện ra với 2 options

5. Chọn cách xếp lại:
   
   Option 1: Xếp thủ công
   ├─ Navigate to ManualSchedule
   ├─ Giữ nguyên: A1, B2, C3 (màu đậm)
   ├─ Load lớp thay thế cho môn D và E
   └─ User tự chọn lớp mới

   Option 2: Xếp tự động (NSGA-II)
   ├─ Gửi request đến NSGA-II service
   ├─ Payload:
   │  ├─ successfulClasses: [A1, B2, C3]
   │  ├─ failedClasses: [D4, E5]
   │  ├─ failedCourseNames: ["Môn D", "Môn E"]
   │  └─ parsedPrompt: "..."
   └─ Nhận kết quả và hiển thị
```

## Implementation

### 1. MySchedules.jsx

#### State Management
```javascript
const [failedClasses, setFailedClasses] = useState([])
const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false)
```

#### Đánh Dấu Lớp Thất Bại
```javascript
const handleToggleFailedClass = (classId) => {
    setFailedClasses(prev => {
        if (prev.includes(classId)) {
            return prev.filter(id => id !== classId)
        } else {
            return [...prev, classId]
        }
    })
}
```

#### UI - Checkbox List
```jsx
<Card size="small">
    <div><strong>Chọn lớp bị lỗi:</strong></div>
    <Space direction="vertical">
        {scheduleData.map(schedule => (
            <Checkbox
                key={schedule.id}
                checked={failedClasses.includes(schedule.id)}
                onChange={() => handleToggleFailedClass(schedule.id)}
            >
                <Tag color={failedClasses.includes(schedule.id) ? 'error' : 'default'}>
                    {schedule.courseName}
                </Tag>
                <span>Lớp {schedule.classNumber}</span>
            </Checkbox>
        ))}
    </Space>
</Card>
```

#### Xử Lý Xếp Lại
```javascript
const handleReschedule = () => {
    if (failedClasses.length === 0) {
        message.warning('Vui lòng chọn ít nhất một lớp bị lỗi')
        return
    }
    setRescheduleModalVisible(true)
}
```

### 2. Reschedule Options Modal

#### Manual Reschedule
```javascript
const handleManualReschedule = () => {
    const failedClassesData = scheduleData.filter(
        s => failedClasses.includes(s.id)
    )
    
    const successfulClassesData = scheduleData.filter(
        s => !failedClasses.includes(s.id)
    )

    const failedCourseNames = [...new Set(
        failedClassesData.map(s => s.courseName)
    )]

    navigate('/manual-schedule', {
        state: {
            rescheduleMode: true,
            successfulClasses: successfulClassesData,
            failedClasses: failedClassesData,
            failedCourseNames: failedCourseNames,
            originalScheduleId: viewingSchedule.id
        }
    })
}
```

#### Auto Reschedule (NSGA-II)
```javascript
const handleAutoReschedule = async () => {
    const failedClassesData = scheduleData.filter(
        s => failedClasses.includes(s.id)
    )
    
    const successfulClassesData = scheduleData.filter(
        s => !failedClasses.includes(s.id)
    )

    const failedCourseNames = [...new Set(
        failedClassesData.map(s => s.courseName)
    )]

    try {
        const response = await studentAPI.rescheduleWithNSGAII({
            successfulClasses: successfulClassesData,
            failedClasses: failedClassesData,
            failedCourseNames: failedCourseNames,
            semesterId: viewingSchedule.semester.id,
            parsedPrompt: viewingSchedule.parsedPrompt
        })

        // Handle response
        message.success('Đã tìm được lịch thay thế')
    } catch (error) {
        message.error('Không thể xếp lịch tự động')
    }
}
```

### 3. ManualSchedule.jsx - Reschedule Mode

#### Receive Data
```javascript
const rescheduleMode = location.state?.rescheduleMode || false
const successfulClasses = location.state?.successfulClasses || []
const failedClasses = location.state?.failedClasses || []
const failedCourseNames = location.state?.failedCourseNames || []
```

#### Initialize State
```javascript
const [confirmedSchedules, setConfirmedSchedules] = useState(
    rescheduleMode ? successfulClasses : []
)
```

#### Load Schedules for Failed Courses
```javascript
const loadSchedulesForFailedCourses = async () => {
    const allSchedulesPromises = failedCourseNames.map(courseName =>
        studentAPI.getSchedulesByCourse(courseName)
    )
    const results = await Promise.all(allSchedulesPromises)
    const combinedSchedules = results.flatMap(r => r.data)
    
    // Add successful classes for display
    setAllSchedules([...successfulClasses, ...combinedSchedules])
}
```

#### Display Alert
```jsx
{rescheduleMode && (
    <Alert
        message="Chế độ xếp lại lịch"
        description={
            <Space direction="vertical">
                <div>
                    ✓ {successfulClasses.length} lớp đã đăng ký thành công (giữ nguyên)
                </div>
                <div>
                    ⚠ {failedClasses.length} lớp bị lỗi - Cần chọn lớp thay thế
                </div>
                <div>
                    Môn cần xếp lại: {failedCourseNames.join(', ')}
                </div>
            </Space>
        }
        type="warning"
        showIcon
    />
)}
```

## UI Components

### 1. View Schedule Modal

**Header:**
```jsx
<Modal
    title={
        <Space>
            <span>Chi tiết lịch học</span>
            {failedClasses.length > 0 && (
                <Tag color="error">{failedClasses.length} lớp bị lỗi</Tag>
            )}
        </Space>
    }
/>
```

**Footer:**
```jsx
footer={[
    <Button key="close" onClick={closeModal}>Đóng</Button>,
    failedClasses.length > 0 && (
        <Button
            key="reschedule"
            type="primary"
            danger
            icon={<WarningOutlined />}
            onClick={handleReschedule}
        >
            Xếp lại lịch ({failedClasses.length} lớp)
        </Button>
    )
]}
```

### 2. Reschedule Options Modal

**Manual Option Card:**
```jsx
<Card hoverable onClick={handleManualReschedule}>
    <Space direction="vertical">
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <EditOutlined style={{ fontSize: 32, color: 'var(--vku-yellow-800)' }} />
            <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                    Xếp thủ công
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>
                    Tự chọn lớp thay thế từ danh sách
                </div>
            </div>
        </div>
        <div style={{ paddingLeft: 44, color: '#999' }}>
            • Xem tất cả lớp còn lại<br />
            • Tự do chọn lớp phù hợp<br />
            • Kiểm tra trùng lịch tự động
        </div>
    </Space>
</Card>
```

**Auto Option Card:**
```jsx
<Card hoverable onClick={handleAutoReschedule}>
    <Space direction="vertical">
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThunderboltOutlined style={{ fontSize: 32, color: 'var(--vku-red)' }} />
            <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                    Xếp tự động (NSGA-II)
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>
                    Để AI tìm lịch tối ưu
                </div>
            </div>
        </div>
        <div style={{ paddingLeft: 44, color: '#999' }}>
            • Giữ nguyên lớp đã đăng ký thành công<br />
            • Tự động tìm lớp thay thế tối ưu<br />
            • Tối ưu hóa theo sở thích
        </div>
    </Space>
</Card>
```

## API Integration

### NSGA-II Reschedule Endpoint

**Request:**
```javascript
POST /api/student/reschedule-nsga2

{
    "successfulClasses": [
        {
            "id": 1,
            "courseName": "Môn A",
            "classNumber": "1",
            "dayOfWeek": "Thứ 2",
            "periods": "[1, 2, 3]",
            // ... other fields
        }
    ],
    "failedClasses": [
        {
            "id": 4,
            "courseName": "Môn D",
            "classNumber": "4",
            // ...
        }
    ],
    "failedCourseNames": ["Môn D", "Môn E"],
    "semesterId": 1,
    "parsedPrompt": "Ưu tiên buổi sáng, tránh thứ 7"
}
```

**Response:**
```javascript
{
    "success": true,
    "newSchedule": [
        // All classes including replacements
    ],
    "replacements": [
        {
            "oldClass": { id: 4, courseName: "Môn D", classNumber: "4" },
            "newClass": { id: 10, courseName: "Môn D", classNumber: "2" }
        }
    ]
}
```

## Visual States

### Calendar Display

**Reschedule Mode:**
```
┌─────────────────────────────────┐
│ Thời khóa biểu                  │
├─────────────────────────────────┤
│ Thứ 2:                          │
│ ┌─────────────────┐             │
│ │ Môn A (Lớp 1)   │ ← Confirmed │
│ │ ✓ Đã đăng ký    │   (Màu đậm) │
│ └─────────────────┘             │
│                                 │
│ Thứ 3:                          │
│ ┌─────────────────┐             │
│ │ Môn D (Lớp 2)   │ ← Preview   │
│ │ Lớp thay thế    │   (Màu nhạt)│
│ └─────────────────┘             │
└─────────────────────────────────┘
```

## Benefits

### 1. User Experience
- ✅ Không mất lịch đã chọn
- ✅ Dễ dàng tìm lớp thay thế
- ✅ Linh hoạt: thủ công hoặc tự động

### 2. Efficiency
- ✅ Giữ nguyên lớp thành công
- ✅ Chỉ xếp lại lớp bị lỗi
- ✅ Tiết kiệm thời gian

### 3. Flexibility
- ✅ 2 options: manual/auto
- ✅ User có quyền kiểm soát
- ✅ AI hỗ trợ khi cần

## Testing Checklist

- [x] Hiển thị danh sách lịch đã lưu
- [x] Click xem chi tiết lịch
- [x] Checkbox để đánh dấu lớp bị lỗi
- [x] Nút "Xếp lại lịch" hiện khi có lớp bị lỗi
- [x] Modal reschedule options hiển thị
- [x] Manual reschedule navigate đúng
- [x] Auto reschedule gọi API (TODO)
- [x] ManualSchedule nhận data đúng
- [x] Alert reschedule mode hiển thị
- [x] Successful classes hiển thị màu đậm
- [x] Failed courses load lớp thay thế
- [x] Conflict detection hoạt động

## Future Enhancements

### 1. Smart Suggestions
AI gợi ý lớp thay thế tốt nhất dựa trên:
- Thời gian gần với lớp cũ
- Cùng giảng viên
- Rating cao

### 2. Batch Reschedule
Xếp lại nhiều lịch cùng lúc

### 3. History Tracking
Lưu lịch sử các lần xếp lại

### 4. Notification
Thông báo khi có lớp thay thế phù hợp

## Kết Luận

Tính năng "Xếp lại lịch khi đăng ký thất bại" đã được implement với:
- ✅ UI/UX trực quan
- ✅ 2 options: Manual/Auto
- ✅ Giữ nguyên lớp thành công
- ✅ Linh hoạt và dễ sử dụng
- ⏳ NSGA-II integration (TODO)
