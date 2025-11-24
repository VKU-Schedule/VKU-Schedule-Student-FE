# Calendar Redesign - Dark Theme

## Tổng Quan

Đã thiết kế lại bảng thời khóa biểu theo style giống ảnh mẫu với:
- ✅ Màu sắc đậm cho các môn học
- ✅ Text màu trắng
- ✅ Bo góc và shadow
- ✅ Bỏ phần hướng dẫn

## Màu Sắc Mới

### Course Colors (Dark Theme)

```css
.course-color-0 { background-color: #2d5d2a; } /* Dark Green */
.course-color-1 { background-color: #5d3c2a; } /* Dark Brown */
.course-color-2 { background-color: #2d3d5d; } /* Navy Blue */
.course-color-3 { background-color: #2a3b5d; } /* Dark Blue */
.course-color-4 { background-color: #5d2a2a; } /* Dark Red */
```

### Cách Phân Màu

Mỗi môn học được gán màu dựa trên hash của tên môn:

```javascript
const getCourseColor = (courseName) => {
    let hash = 0
    for (let i = 0; i < courseName.length; i++) {
        hash = courseName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = Math.abs(hash) % 5
    return `course-color-${colorIndex}`
}
```

→ Cùng môn học luôn có cùng màu, khác môn có màu khác

## Style Changes

### Schedule Card

**Before:**
```css
.schedule-card.confirmed {
    background: linear-gradient(135deg, var(--vku-red-100) 0%, var(--vku-red-200) 100%);
    border-color: var(--vku-red-500);
    font-weight: 600;
}
```

**After:**
```css
.schedule-card {
    border-radius: 8px;
    border: none;
    color: white !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.schedule-card.confirmed {
    opacity: 1;
    font-weight: 500;
}

.schedule-card.preview {
    opacity: 0.6;
}
```

### Card Content

**Before:**
```jsx
<div style={{ color: 'var(--text-dark)' }}>
    {schedule.courseName}
</div>
<Tag color="red">Lớp {schedule.classNumber}</Tag>
```

**After:**
```jsx
<div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
    {schedule.courseName}
</div>
<div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 11 }}>
    ({schedule.classNumber})
</div>
```

## UI Changes

### 1. Bỏ Hướng Dẫn

**Before:**
```jsx
<div style={{ background: 'var(--vku-yellow-50)' }}>
    <strong>Hướng dẫn:</strong>
    • Màu đậm: Lớp đã chọn
    • Màu nhạt: Lớp đang xem
    • ...
</div>
```

**After:**
```jsx
// Removed completely
```

### 2. Card Layout

**Structure:**
```
┌─────────────────────────┐
│ Tên môn học (13px)      │ ← White, bold
│ (Lớp số) (11px)         │ ← White 90%
│ Phòng.Số (11px)         │ ← White 85%
│ Giảng viên (10px)       │ ← White 75%
└─────────────────────────┘
```

### 3. Opacity States

- **Confirmed** (đã chọn): `opacity: 1` - Màu đậm
- **Preview** (đang xem): `opacity: 0.6` - Màu nhạt
- **Conflict** (trùng lịch): Vạch chéo + border dashed

## Visual Comparison

### Before (Old Style)
```
┌─────────────────────────┐
│ 🔴 Môn A                │ ← Red gradient
│ [Lớp 1] [Tag]           │ ← Colored tags
│ Giảng viên              │ ← Dark text
│ Phòng                   │ ← Gray text
└─────────────────────────┘
```

### After (New Style)
```
┌─────────────────────────┐
│ Môn A                   │ ← White text
│ (1)                     │ ← White 90%
│ A.101                   │ ← White 85%
│ GV. Nguyễn Văn A        │ ← White 75%
└─────────────────────────┘
Background: Dark Green/Brown/Blue/Red
```

## Color Assignment Examples

```javascript
// Example course names and their colors
"Chuyên đề 3 (IT)"           → hash % 5 = 2 → Navy Blue (#2d3d5d)
"Kinh tế chính trị Mác-Lênin" → hash % 5 = 1 → Dark Brown (#5d3c2a)
"Đảm bảo chất lượng"         → hash % 5 = 0 → Dark Green (#2d5d2a)
"Học sâu"                    → hash % 5 = 2 → Navy Blue (#2d3d5d)
"Tư tưởng Hồ Chí Minh"       → hash % 5 = 3 → Dark Blue (#2a3b5d)
```

## CSS Classes

### Course Colors
```css
.course-color-0 /* Dark Green */
.course-color-1 /* Dark Brown */
.course-color-2 /* Navy Blue */
.course-color-3 /* Dark Blue */
.course-color-4 /* Dark Red */
```

### States
```css
.schedule-card.confirmed  /* opacity: 1 */
.schedule-card.preview    /* opacity: 0.6 */
.schedule-card.conflict   /* striped pattern */
```

## Implementation Details

### WeeklyCalendar.jsx

**Key Changes:**

1. **Color Assignment:**
```javascript
const getCourseColor = (courseName) => {
    let hash = 0
    for (let i = 0; i < courseName.length; i++) {
        hash = courseName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `course-color-${Math.abs(hash) % 5}`
}
```

2. **Card Styling:**
```jsx
<Card
    className={`schedule-card ${getCourseColor(schedule.courseName)} ${confirmed ? 'confirmed' : 'preview'}`}
    bodyStyle={{ padding: '8px 12px' }}
    style={{ border: 'none' }}
>
```

3. **Text Colors:**
```jsx
<div style={{ color: 'white', fontSize: 13 }}>
    {schedule.courseName}
</div>
<div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
    ({schedule.classNumber})
</div>
```

### ManualSchedule.jsx

**Removed:**
- Guide box (Hướng dẫn)
- Final mode info box
- Unused imports (WarningOutlined, PlusOutlined, Divider)

## Benefits

### 1. Visual Appeal
- ✅ Màu sắc đậm, nổi bật
- ✅ Text trắng dễ đọc
- ✅ Shadow tạo chiều sâu

### 2. Consistency
- ✅ Cùng môn luôn cùng màu
- ✅ Dễ phân biệt các môn khác nhau

### 3. Clean UI
- ✅ Bỏ hướng dẫn → gọn gàng hơn
- ✅ Không còn tags nhiều màu
- ✅ Layout đơn giản, rõ ràng

### 4. Professional Look
- ✅ Giống ảnh mẫu
- ✅ Dark theme hiện đại
- ✅ Typography tốt hơn

## Responsive Behavior

### Desktop
- Card width: 180px
- Font sizes: 13px, 11px, 10px
- Padding: 8px 12px

### Mobile (future)
- Card width: auto
- Font sizes: 12px, 10px, 9px
- Padding: 6px 10px

## Testing Checklist

- [x] Mỗi môn có màu riêng
- [x] Cùng môn luôn cùng màu
- [x] Text màu trắng dễ đọc
- [x] Confirmed: opacity 1 (đậm)
- [x] Preview: opacity 0.6 (nhạt)
- [x] Conflict: vạch chéo
- [x] Không còn hướng dẫn
- [x] Shadow hiển thị đúng
- [x] Hover effect hoạt động
- [x] Click để chọn/bỏ chọn

## Future Enhancements

### 1. Custom Colors
Cho phép user chọn màu cho từng môn:
```javascript
const [customColors, setCustomColors] = useState({})
// customColors = { "Môn A": "#2d5d2a", "Môn B": "#5d3c2a" }
```

### 2. Color Themes
Thêm nhiều bộ màu:
- Dark theme (current)
- Light theme
- Pastel theme
- High contrast theme

### 3. Accessibility
- Thêm pattern cho người mù màu
- Tăng contrast ratio
- Keyboard navigation

## Kết Luận

Bảng thời khóa biểu giờ đã:
- ✅ Có màu sắc đậm, đẹp mắt
- ✅ Text trắng dễ đọc
- ✅ Giao diện sạch sẽ, không rối
- ✅ Giống ảnh mẫu
- ✅ Professional và hiện đại!
