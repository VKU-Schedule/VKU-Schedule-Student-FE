import {
  mockUser,
  mockAcademicYears,
  mockSemesters,
  mockCohorts,
  mockClasses,
  mockCourses,
  mockSchedules,
  mockSearchResults,
  mockUserSchedules
} from './mockData'

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock Auth APIs
export const mockAuthAPI = {
  login: async (credential) => {
    await delay()
    return { data: mockUser }
  },
  
  getCurrentUser: async () => {
    await delay()
    return { data: mockUser }
  }
}

// Mock Student APIs
export const mockStudentAPI = {
  getAcademicYears: async () => {
    await delay()
    return { data: mockAcademicYears }
  },
  
  getSemesters: async (academicYearId) => {
    await delay()
    return { data: mockSemesters }
  },
  
  getCohorts: async (semesterId) => {
    await delay()
    return { data: mockCohorts }
  },
  
  getClasses: async (cohortId) => {
    await delay()
    const cohort = mockCohorts.find(c => c.id === cohortId)
    if (!cohort) return { data: [] }
    
    const classes = mockClasses.filter(c => c.cohort.id === cohortId)
    return { data: classes }
  },
  
  getCourses: async (classId) => {
    await delay()
    const classEntity = mockClasses.find(c => c.id === classId)
    if (!classEntity) return { data: [] }
    
    const courses = mockCourses.filter(c => c.classEntity.id === classId)
    return { data: courses }
  },
  
  getSchedulesByCourse: async (courseName) => {
    await delay()
    const schedules = mockSchedules.filter(s => 
      s.courseName.toLowerCase().includes(courseName.toLowerCase())
    )
    return { data: schedules }
  },
  
  saveSchedule: async (data) => {
    await delay()
    const newSchedule = {
      id: mockUserSchedules.length + 1,
      user: mockUser,
      semester: mockSemesters.find(s => s.id === data.semesterId),
      schedule: JSON.stringify(data.schedules),
      parsedPrompt: data.parsedPrompt || null,
      createdAt: new Date().toISOString()
    }
    mockUserSchedules.push(newSchedule)
    return { data: newSchedule }
  },
  
  getMySchedules: async (userId, semesterId) => {
    await delay()
    let schedules = mockUserSchedules.filter(s => s.user.id === userId)
    
    if (semesterId) {
      schedules = schedules.filter(s => s.semester.id === semesterId)
    }
    
    return { data: schedules }
  },
  
  deleteSchedule: async (scheduleId) => {
    await delay()
    const index = mockUserSchedules.findIndex(s => s.id === scheduleId)
    if (index > -1) {
      mockUserSchedules.splice(index, 1)
    }
    return { data: { success: true } }
  }
}

// Mock Search API
export const mockSearchAPI = {
  searchCourses: async (query) => {
    await delay()
    const results = mockSearchResults.filter(r =>
      r.searchText.toLowerCase().includes(query.toLowerCase())
    )
    return { data: results }
  },
  
  searchByName: async (courseName) => {
    await delay()
    const results = mockSearchResults.filter(r =>
      r.courseName.toLowerCase().includes(courseName.toLowerCase())
    )
    return { data: results }
  },
  
  searchBySubtopic: async (subtopic) => {
    await delay()
    const results = mockSearchResults.filter(r =>
      r.subtopic && r.subtopic.toLowerCase().includes(subtopic.toLowerCase())
    )
    return { data: results }
  }
}
