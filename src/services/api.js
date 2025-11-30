import axios from 'axios'
import { mockAuthAPI, mockStudentAPI, mockSearchAPI } from './mockApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL || 'http://localhost:8082'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important: Send cookies with requests
})

const searchApi = axios.create({
  baseURL: SEARCH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Helper to switch between mock and real API
const useMockOrReal = (mockFn, realFn) => {
  return USE_MOCK ? mockFn : realFn
}

// Auth APIs
export const authAPI = {
  login: (credential) => useMockOrReal(
    () => mockAuthAPI.login(credential),
    () => api.post('/api/auth/login', { credential })
  )(),
  
  getCurrentUser: () => useMockOrReal(
    () => mockAuthAPI.getCurrentUser(),
    () => api.get('/api/auth/user')
  )()
}

// Student APIs
export const studentAPI = {
  // Get academic years
  getAcademicYears: () => useMockOrReal(
    () => mockStudentAPI.getAcademicYears(),
    () => api.get('/api/student/academic-years')
  )(),
  
  // Get semesters by academic year
  getSemesters: (academicYearId) => useMockOrReal(
    () => mockStudentAPI.getSemesters(academicYearId),
    () => api.get('/api/student/semesters', { params: { academicYearId } })
  )(),
  
  // Get cohorts by semester
  getCohorts: (semesterId) => useMockOrReal(
    () => mockStudentAPI.getCohorts(semesterId),
    () => api.get('/api/student/cohorts', { params: { semesterId } })
  )(),
  
  // Get classes by cohort
  getClasses: (cohortId) => useMockOrReal(
    () => mockStudentAPI.getClasses(cohortId),
    () => api.get('/api/student/classes', { params: { cohortId } })
  )(),
  
  // Get courses by class
  getCourses: (classId) => useMockOrReal(
    () => mockStudentAPI.getCourses(classId),
    () => api.get('/api/student/courses', { params: { classId } })
  )(),
  
  // Get schedules by course
  getSchedulesByCourse: (courseName, subtopic) => useMockOrReal(
    () => mockStudentAPI.getSchedulesByCourse(courseName, subtopic),
    () => api.get('/api/student/schedules/by-course', { params: { courseName, subtopic } })
  )(),
  
  // Save schedule
  saveSchedule: (data) => useMockOrReal(
    () => mockStudentAPI.saveSchedule(data),
    () => api.post('/api/student/schedules/save', data)
  )(),
  
  // Get my schedules
  getMySchedules: (userId, semesterId) => useMockOrReal(
    () => mockStudentAPI.getMySchedules(userId, semesterId),
    () => api.get('/api/student/schedules/my-schedules', { 
      params: { userId, semesterId } 
    })
  )(),
  
  // Delete schedule
  deleteSchedule: (scheduleId) => useMockOrReal(
    () => mockStudentAPI.deleteSchedule(scheduleId),
    () => api.delete(`/api/student/schedules/${scheduleId}`)
  )(),

  // Update schedule
  updateSchedule: (scheduleId, data) => useMockOrReal(
    () => mockStudentAPI.saveSchedule(data),
    () => api.put(`/api/student/schedules/${scheduleId}`, data)
  )()
}

// Search API
export const searchAPI = {
  searchCourses: (query) => useMockOrReal(
    () => mockSearchAPI.searchCourses(query),
    () => searchApi.get('/api/courses/search', { params: { query } })
  )(),
  
  searchByName: (courseName) => useMockOrReal(
    () => mockSearchAPI.searchByName(courseName),
    () => searchApi.get('/api/courses/search/by-name', { params: { courseName } })
  )(),
  
  searchBySubtopic: (subtopic) => useMockOrReal(
    () => mockSearchAPI.searchBySubtopic(subtopic),
    () => searchApi.get('/api/courses/search/by-subtopic', { params: { subtopic } })
  )()
}

export default api
