import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = async (credential) => {
        try {
            // Send Google credential to backend
            const response = await authAPI.login(credential)
            const userData = response.data

            // Validate VKU email
            if (!userData.email || !userData.email.endsWith('@vku.udn.vn')) {
                throw new Error('Chỉ chấp nhận email @vku.udn.vn')
            }

            // Ensure user has ID
            if (!userData.id) {
                throw new Error('Dữ liệu người dùng không hợp lệ')
            }

            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            return userData
        } catch (error) {
            // Provide more specific error message
            if (error.response) {
                throw new Error(error.response.data?.message || 'Đăng nhập thất bại')
            } else if (error.request) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.')
            }
            throw error
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
