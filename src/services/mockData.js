// Mock data for testing without backend

export const mockUser = {
  id: 1,
  email: 'student@vku.udn.vn',
  name: 'Nguyễn Văn A',
  picture: 'https://via.placeholder.com/150'
}

export const mockAcademicYears = [
  { id: 1, yearName: '2024-2025' },
  { id: 2, yearName: '2025-2026' }
]

export const mockSemesters = [
  { 
    id: 1, 
    semesterName: 'Học kỳ 1',
    academicYear: { id: 2, yearName: '2025-2026' }
  },
  { 
    id: 2, 
    semesterName: 'Học kỳ 2',
    academicYear: { id: 2, yearName: '2025-2026' }
  }
]

export const mockCohorts = [
  { id: 1, cohortCode: '19', semester: mockSemesters[0] },
  { id: 2, cohortCode: '20', semester: mockSemesters[0] },
  { id: 3, cohortCode: '21', semester: mockSemesters[0] },
  { id: 4, cohortCode: '22', semester: mockSemesters[0] }
]

export const mockClasses = [
  { id: 1, classCode: '19SE1', cohort: mockCohorts[0] },
  { id: 2, classCode: '19SE2', cohort: mockCohorts[0] },
  { id: 3, classCode: '19SE3', cohort: mockCohorts[0] },
  { id: 4, classCode: '20IT1', cohort: mockCohorts[1] },
  { id: 5, classCode: '20IT2', cohort: mockCohorts[1] },
  { id: 6, classCode: '21SE1', cohort: mockCohorts[2] }
]

export const mockCourses = [
  {
    id: 1,
    courseName: 'Lập trình Java',
    subtopic: 'Nâng cao',
    theoryCredits: 3.0,
    practicalCredits: 1.0,
    totalCredits: 4.0,
    note: null,
    classEntity: mockClasses[0]
  },
  {
    id: 2,
    courseName: 'Cơ sở dữ liệu',
    subtopic: null,
    theoryCredits: 3.0,
    practicalCredits: 1.0,
    totalCredits: 4.0,
    note: null,
    classEntity: mockClasses[0]
  },
  {
    id: 3,
    courseName: 'Mạng máy tính',
    subtopic: 'Cơ bản',
    theoryCredits: 2.0,
    practicalCredits: 1.0,
    totalCredits: 3.0,
    note: null,
    classEntity: mockClasses[0]
  },
  {
    id: 4,
    courseName: 'Công nghệ phần mềm',
    subtopic: null,
    theoryCredits: 3.0,
    practicalCredits: 0.0,
    totalCredits: 3.0,
    note: null,
    classEntity: mockClasses[0]
  },
  {
    id: 5,
    courseName: 'Trí tuệ nhân tạo',
    subtopic: 'Machine Learning',
    theoryCredits: 3.0,
    practicalCredits: 1.0,
    totalCredits: 4.0,
    note: null,
    classEntity: mockClasses[0]
  }
]

export const mockSchedules = [
  // Lập trình Java - 3 lớp
  {
    id: 1,
    courseName: 'Lập trình Java',
    classNumber: 1,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '19SE1, 19SE2',
    subtopic: 'Nâng cao',
    instructor: 'TS. Nguyễn Văn A',
    dayOfWeek: 'Thứ 2',
    periods: '[1, 2, 3]',
    location: 'A',
    roomNumber: '101',
    weeks: '1-16',
    capacity: 50
  },
  {
    id: 2,
    courseName: 'Lập trình Java',
    classNumber: 2,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '19SE3, 20IT1',
    subtopic: 'Nâng cao',
    instructor: 'ThS. Trần Thị B',
    dayOfWeek: 'Thứ 3',
    periods: '[4, 5, 6]',
    location: 'B',
    roomNumber: '205',
    weeks: '1-16',
    capacity: 45
  },
  {
    id: 3,
    courseName: 'Lập trình Java',
    classNumber: 3,
    language: 'Tiếng Anh',
    major: 'CNTT',
    classGroup: '20IT2, 21SE1',
    subtopic: 'Nâng cao',
    instructor: 'Dr. Lê Văn C',
    dayOfWeek: 'Thứ 5',
    periods: '[7, 8, 9]',
    location: 'C',
    roomNumber: '301',
    weeks: '1-16',
    capacity: 40
  },
  
  // Cơ sở dữ liệu - 3 lớp
  {
    id: 4,
    courseName: 'Cơ sở dữ liệu',
    classNumber: 1,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '19SE1, 19SE2',
    subtopic: null,
    instructor: 'PGS.TS. Phạm Văn D',
    dayOfWeek: 'Thứ 2',
    periods: '[4, 5, 6]',
    location: 'A',
    roomNumber: '102',
    weeks: '1-16',
    capacity: 50
  },
  {
    id: 5,
    courseName: 'Cơ sở dữ liệu',
    classNumber: 2,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '19SE3, 20IT1',
    subtopic: null,
    instructor: 'TS. Hoàng Thị E',
    dayOfWeek: 'Thứ 4',
    periods: '[1, 2, 3]',
    location: 'B',
    roomNumber: '206',
    weeks: '1-16',
    capacity: 45
  },
  {
    id: 6,
    courseName: 'Cơ sở dữ liệu',
    classNumber: 3,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '20IT2, 21SE1',
    subtopic: null,
    instructor: 'ThS. Vũ Văn F',
    dayOfWeek: 'Thứ 6',
    periods: '[4, 5, 6]',
    location: 'C',
    roomNumber: '302',
    weeks: '1-16',
    capacity: 40
  },

  // Mạng máy tính - 2 lớp
  {
    id: 7,
    courseName: 'Mạng máy tính',
    classNumber: 1,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '19SE1, 19SE2, 19SE3',
    subtopic: 'Cơ bản',
    instructor: 'TS. Đỗ Văn G',
    dayOfWeek: 'Thứ 3',
    periods: '[1, 2, 3]',
    location: 'A',
    roomNumber: '103',
    weeks: '1-16',
    capacity: 60
  },
  {
    id: 8,
    courseName: 'Mạng máy tính',
    classNumber: 2,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '20IT1, 20IT2',
    subtopic: 'Cơ bản',
    instructor: 'ThS. Bùi Thị H',
    dayOfWeek: 'Thứ 5',
    periods: '[1, 2, 3]',
    location: 'B',
    roomNumber: '207',
    weeks: '1-16',
    capacity: 50
  },

  // Công nghệ phần mềm - 2 lớp
  {
    id: 9,
    courseName: 'Công nghệ phần mềm',
    classNumber: 1,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '19SE1, 19SE2',
    subtopic: null,
    instructor: 'PGS.TS. Ngô Văn I',
    dayOfWeek: 'Thứ 4',
    periods: '[7, 8, 9]',
    location: 'A',
    roomNumber: '104',
    weeks: '1-16',
    capacity: 50
  },
  {
    id: 10,
    courseName: 'Công nghệ phần mềm',
    classNumber: 2,
    language: 'Tiếng Anh',
    major: 'CNTT',
    classGroup: '20IT1, 20IT2',
    subtopic: null,
    instructor: 'Dr. Đinh Thị K',
    dayOfWeek: 'Thứ 6',
    periods: '[1, 2, 3]',
    location: 'C',
    roomNumber: '303',
    weeks: '1-16',
    capacity: 40
  },

  // Trí tuệ nhân tạo - 2 lớp
  {
    id: 11,
    courseName: 'Trí tuệ nhân tạo',
    classNumber: 1,
    language: 'Tiếng Việt',
    major: 'CNTT',
    classGroup: '19SE1, 19SE2, 19SE3',
    subtopic: 'Machine Learning',
    instructor: 'TS. Lý Văn L',
    dayOfWeek: 'Thứ 2',
    periods: '[7, 8, 9]',
    location: 'A',
    roomNumber: '105',
    weeks: '1-16',
    capacity: 55
  },
  {
    id: 12,
    courseName: 'Trí tuệ nhân tạo',
    classNumber: 2,
    language: 'Tiếng Anh',
    major: 'CNTT',
    classGroup: '20IT1, 20IT2, 21SE1',
    subtopic: 'Machine Learning',
    instructor: 'Dr. Mai Thị M',
    dayOfWeek: 'Thứ 4',
    periods: '[4, 5, 6]',
    location: 'B',
    roomNumber: '208',
    weeks: '1-16',
    capacity: 45
  }
]

export const mockSearchResults = [
  {
    id: 'uuid-1',
    courseName: 'Lập trình Java',
    subtopic: 'Nâng cao',
    searchText: 'Lập trình Java @ Nâng cao',
    theoryCredits: 3.0,
    practicalCredits: 1.0,
    totalCredits: 4.0,
    courseId: 1
  },
  {
    id: 'uuid-2',
    courseName: 'Cơ sở dữ liệu',
    subtopic: null,
    searchText: 'Cơ sở dữ liệu',
    theoryCredits: 3.0,
    practicalCredits: 1.0,
    totalCredits: 4.0,
    courseId: 2
  },
  {
    id: 'uuid-3',
    courseName: 'Mạng máy tính',
    subtopic: 'Cơ bản',
    searchText: 'Mạng máy tính @ Cơ bản',
    theoryCredits: 2.0,
    practicalCredits: 1.0,
    totalCredits: 3.0,
    courseId: 3
  },
  {
    id: 'uuid-4',
    courseName: 'Công nghệ phần mềm',
    subtopic: null,
    searchText: 'Công nghệ phần mềm',
    theoryCredits: 3.0,
    practicalCredits: 0.0,
    totalCredits: 3.0,
    courseId: 4
  },
  {
    id: 'uuid-5',
    courseName: 'Trí tuệ nhân tạo',
    subtopic: 'Machine Learning',
    searchText: 'Trí tuệ nhân tạo @ Machine Learning',
    theoryCredits: 3.0,
    practicalCredits: 1.0,
    totalCredits: 4.0,
    courseId: 5
  }
]

export const mockUserSchedules = [
  {
    id: 1,
    user: mockUser,
    semester: mockSemesters[0],
    schedule: JSON.stringify([
      mockSchedules[0], // Java lớp 1
      mockSchedules[4], // CSDL lớp 2
      mockSchedules[6]  // Mạng lớp 1
    ]),
    parsedPrompt: 'Ưu tiên buổi sáng, tránh thứ 7',
    createdAt: '2025-11-20T10:30:00'
  },
  {
    id: 2,
    user: mockUser,
    semester: mockSemesters[0],
    schedule: JSON.stringify([
      mockSchedules[1], // Java lớp 2
      mockSchedules[5], // CSDL lớp 3
      mockSchedules[8]  // CNPM lớp 1
    ]),
    parsedPrompt: null,
    createdAt: '2025-11-22T14:15:00'
  }
]
