import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL || 'http://localhost:8082'

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

// Auth APIs
export const authAPI = {
  login: (credential) => api.post('/auth/login', { credential }),
  getCurrentUser: () => api.get('/auth/user')
}

// Student APIs
export const studentAPI = {
  // Get academic years
  getAcademicYears: () => api.get('/student/academic-years'),
  
  // Get semesters by academic year
  getSemesters: (academicYearId) => 
    api.get('/student/semesters', { params: { academicYearId } }),
  
  // Get cohorts by semester
  getCohorts: (semesterId) => 
    api.get('/student/cohorts', { params: { semesterId } }),
  
  // Get classes by cohort
  getClasses: (cohortId) => 
    api.get('/student/classes', { params: { cohortId } }),
  
  // Get courses by class
  getCourses: (classId) => 
    api.get('/student/courses', { params: { classId } }),
  
  // Get schedules by course
  getSchedulesByCourse: (courseName) => 
    api.get('/student/schedules/by-course', { params: { courseName } }),
  
  // Save schedule
  saveSchedule: (data) => api.post('/student/schedules/save', data),
  
  // Get my schedules
  getMySchedules: (userId, semesterId) => 
    api.get('/student/schedules/my-schedules', { 
      params: { userId, semesterId } 
    }),
  
  // Delete schedule
  deleteSchedule: (scheduleId) => 
    api.delete(`/student/schedules/${scheduleId}`)
}

// Search API
export const searchAPI = {
  searchCourses: (query) => 
    searchApi.get('/api/courses/search', { params: { query } }),
  
  searchByName: (courseName) =>
    searchApi.get('/api/courses/search/by-name', { params: { courseName } }),
  
  searchBySubtopic: (subtopic) =>
    searchApi.get('/api/courses/search/by-subtopic', { params: { subtopic } })
}

export default api
