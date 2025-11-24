import axios from 'axios'
import { mockAuthAPI, mockStudentAPI, mockSearchAPI } from './mockApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL || 'http://localhost:8082'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
    () => api.post('/auth/login', { credential })
  )(),
  
  getCurrentUser: () => useMockOrReal(
    () => mockAuthAPI.getCurrentUser(),
    () => api.get('/auth/user')
  )()
}

// Student APIs
export const studentAPI = {
  // Get academic years
  getAcademicYears: () => useMockOrReal(
    () => mockStudentAPI.getAcademicYears(),
    () => api.get('/student/academic-years')
  )(),
  
  // Get semesters by academic year
  getSemesters: (academicYearId) => useMockOrReal(
    () => mockStudentAPI.getSemesters(academicYearId),
    () => api.get('/student/semesters', { params: { academicYearId } })
  )(),
  
  // Get cohorts by semester
  getCohorts: (semesterId) => useMockOrReal(
    () => mockStudentAPI.getCohorts(semesterId),
    () => api.get('/student/cohorts', { params: { semesterId } })
  )(),
  
  // Get classes by cohort
  getClasses: (cohortId) => useMockOrReal(
    () => mockStudentAPI.getClasses(cohortId),
    () => api.get('/student/classes', { params: { cohortId } })
  )(),
  
  // Get courses by class
  getCourses: (classId) => useMockOrReal(
    () => mockStudentAPI.getCourses(classId),
    () => api.get('/student/courses', { params: { classId } })
  )(),
  
  // Get schedules by course
  getSchedulesByCourse: (courseName) => useMockOrReal(
    () => mockStudentAPI.getSchedulesByCourse(courseName),
    () => api.get('/student/schedules/by-course', { params: { courseName } })
  )(),
  
  // Save schedule
  saveSchedule: (data) => useMockOrReal(
    () => mockStudentAPI.saveSchedule(data),
    () => api.post('/student/schedules/save', data)
  )(),
  
  // Get my schedules
  getMySchedules: (userId, semesterId) => useMockOrReal(
    () => mockStudentAPI.getMySchedules(userId, semesterId),
    () => api.get('/student/schedules/my-schedules', { 
      params: { userId, semesterId } 
    })
  )(),
  
  // Delete schedule
  deleteSchedule: (scheduleId) => useMockOrReal(
    () => mockStudentAPI.deleteSchedule(scheduleId),
    () => api.delete(`/student/schedules/${scheduleId}`)
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
