import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './index.css'
import './styles/theme.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'

// VKU Theme Configuration
const vkuTheme = {
    token: {
        colorPrimary: '#E31E24',
        colorSuccess: '#FFD100',
        colorInfo: '#2B3990',
        colorWarning: '#FF9800',
        colorError: '#E31E24',
        borderRadius: 8,
        fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <ConfigProvider locale={viVN} theme={vkuTheme}>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </ConfigProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
