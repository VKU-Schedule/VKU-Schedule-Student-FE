# VKU Schedule - Student Web

Web application cho sinh viên xếp lịch học thông minh.

## Tính năng

### ✅ Đã hoàn thành

1. **Đăng nhập**
   - Google OAuth 2.0
   - Validate email @vku.udn.vn
   - Tự động tạo user

2. **Chọn môn học**
   - Dropdown: Năm học → Học kỳ → Khóa → Lớp → Môn
   - Tìm kiếm qua Elasticsearch
   - Quản lý danh sách môn đã chọn

3. **Xếp lịch thủ công**
   - Hiển thị bảng thời khóa biểu tuần
   - Click chọn lớp từ các ô
   - Kiểm tra xung đột lịch
   - Lưu lịch đã xếp

4. **Quản lý lịch**
   - Xem lịch đã lưu
   - Xóa lịch
   - Hiển thị chi tiết

### 🚧 Đang phát triển

1. **Xếp lịch tự động (NSGA-II)**
   - Tích hợp với NSGA-II Service
   - Input: Môn học, Prompt, Trọng số
   - Output: Lịch tối ưu

2. **Xếp lại khi đăng ký thất bại**
   - Đánh dấu lớp thất bại
   - Gợi ý lớp thay thế
   - Xếp lại tự động

## Cài đặt

### 1. Install dependencies

```bash
npm install
```

### 2. Cấu hình

Tạo file `.env`:

```bash
cp .env.example .env
```

Cập nhật các giá trị:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_BASE_URL=http://localhost:8081
VITE_SEARCH_API_URL=http://localhost:8082
```

### 3. Chạy development server

```bash
npm run dev
```

Mở http://localhost:3001

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Layout/
│   │   └── StudentLayout.jsx      # Main layout với sidebar
│   ├── Course/
│   │   ├── CourseSelector.jsx     # Dropdown chọn môn
│   │   └── CourseSearch.jsx       # Tìm kiếm môn
│   └── Schedule/
│       └── WeeklyCalendar.jsx     # Bảng lịch tuần
├── pages/
│   ├── Login.jsx                  # Đăng nhập Google
│   ├── Home.jsx                   # Trang chủ
│   ├── SelectCourses.jsx          # Chọn môn học
│   ├── ManualSchedule.jsx         # Xếp lịch thủ công
│   └── MySchedules.jsx            # Quản lý lịch
├── contexts/
│   └── AuthContext.jsx            # Context quản lý auth
├── services/
│   └── api.js                     # API calls
├── App.jsx
├── main.jsx
└── index.css
```

## API Integration

### User Service (Port 8081)

```javascript
// Get academic years
GET /api/student/academic-years

// Get semesters
GET /api/student/semesters?academicYearId={id}

// Get cohorts
GET /api/student/cohorts?semesterId={id}

// Get classes
GET /api/student/classes?cohortId={id}

// Get courses
GET /api/student/courses?classId={id}

// Get schedules by course
GET /api/student/schedules/by-course?courseName={name}

// Save schedule
POST /api/student/schedules/save
Body: {
  userId: number,
  semesterId: number,
  schedules: ScheduleDTO[],
  parsedPrompt?: string
}

// Get my schedules
GET /api/student/schedules/my-schedules?userId={id}&semesterId={id}

// Delete schedule
DELETE /api/student/schedules/{id}
```

### Search Service (Port 8082)

```javascript
// Search courses
GET /api/courses/search?query={text}

// Search by name
GET /api/courses/search/by-name?courseName={name}

// Search by subtopic
GET /api/courses/search/by-subtopic?subtopic={topic}
```

## Components

### CourseSelector

Dropdown cascade để chọn môn học:

```jsx
<CourseSelector 
  onCourseSelect={(course) => console.log(course)}
/>
```

### CourseSearch

Tìm kiếm môn học qua Elasticsearch:

```jsx
<CourseSearch 
  onCourseSelect={(course) => console.log(course)}
/>
```

### WeeklyCalendar

Hiển thị lịch học theo tuần:

```jsx
<WeeklyCalendar
  schedules={allSchedules}
  selectedSchedules={selectedSchedules}
  onSelectSchedule={(schedule) => handleSelect(schedule)}
/>
```

## Workflow

### 1. Chọn môn học

```
Trang chủ → Chọn môn học
  ├─ Tab 1: Chọn từ dropdown
  │   └─ Năm học → Học kỳ → Khóa → Lớp → Môn
  └─ Tab 2: Tìm kiếm
      └─ Search box → Kết quả → Click chọn
```

### 2. Xếp lịch thủ công

```
Chọn môn học → Xếp lịch thủ công
  ├─ Nhập tên môn → Tìm lịch
  ├─ Hiển thị bảng lịch tuần
  ├─ Click chọn lớp (kiểm tra xung đột)
  └─ Lưu lịch
```

### 3. Xếp lịch tự động (TODO)

```
Chọn môn học → Xếp lịch tự động
  ├─ Nhập prompt (ưu tiên, tránh...)
  ├─ Chọn trọng số
  ├─ Gửi đến NSGA-II Service
  ├─ Nhận kết quả tối ưu
  └─ Lưu lịch
```

## Build

```bash
npm run build
```

Output: `dist/`

## Deploy

### Nginx config

```nginx
server {
    listen 80;
    server_name student.vku-schedule.com;
    
    root /var/www/student-web/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Google OAuth không hoạt động

1. Kiểm tra `VITE_GOOGLE_CLIENT_ID` trong `.env`
2. Kiểm tra redirect URI trong Google Cloud Console
3. Đảm bảo domain được authorize

### API không kết nối được

1. Kiểm tra backend đang chạy (port 8081, 8082)
2. Kiểm tra CORS settings
3. Kiểm tra proxy config trong `vite.config.js`

### Lịch không hiển thị đúng

1. Kiểm tra format của `periods` field
2. Kiểm tra `dayOfWeek` có đúng format không
3. Check console log để debug

## TODO

- [ ] Tích hợp NSGA-II Service
- [ ] Implement xếp lại khi đăng ký thất bại
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Add unit tests
- [ ] Optimize performance
- [ ] Add PWA support
- [ ] Add dark mode
