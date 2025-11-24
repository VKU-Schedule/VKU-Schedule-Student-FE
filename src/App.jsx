import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Spin } from 'antd'
import Login from './pages/Login'
import StudentLayout from './components/Layout/StudentLayout'
import Home from './pages/Home'
import SelectCourses from './pages/SelectCourses'
import ManualSchedule from './pages/ManualSchedule'
import MySchedules from './pages/MySchedules'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        )
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <StudentLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="select-courses" element={<SelectCourses />} />
                <Route path="manual-schedule" element={<ManualSchedule />} />
                <Route path="my-schedules" element={<MySchedules />} />
            </Route>
        </Routes>
    )
}

export default App
