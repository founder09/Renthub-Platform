import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import ListingIndex from './pages/ListingIndex'
import ListingShow from './pages/ListingShow'
import ListingNew from './pages/ListingNew'
import ListingEdit from './pages/ListingEdit'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfilePage from './pages/ProfilePage'

import DashboardLayout from './layouts/DashboardLayout'
import DashboardIndex from './pages/dashboard/DashboardIndex'
import BookingsDashboard from './pages/dashboard/BookingsDashboard'
import NotificationsPage from './pages/dashboard/NotificationsPage'
import SubscriptionPage from './pages/dashboard/SubscriptionPage'
import AnalyticsDashboard from './pages/dashboard/AnalyticsDashboard'
import AIToolsPage from './pages/dashboard/AIToolsPage'
import AdminUsersPage from './pages/dashboard/AdminUsersPage'
import { SubscriptionProvider } from './context/SubscriptionContext'

// We will conditionally render Navbar and Footer based on route or create a MainLayout
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen pt-16" style={{ background: 'var(--bg-primary)' }}>
      {children}
    </main>
    <Footer />
  </>
)

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
                  fontSize: '14.5px',
                  fontWeight: '500',
                  padding: '16px 24px',
                  letterSpacing: '-0.01em',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981', // Tailwind emerald-500
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444', // Tailwind red-500
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              {/* Standard Pages */}
              <Route path="/" element={<MainLayout><ListingIndex /></MainLayout>} />
              <Route path="/listings" element={<MainLayout><ListingIndex /></MainLayout>} />
              <Route path="/listings/:id" element={<MainLayout><ListingShow /></MainLayout>} />
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />

              {/* Protected standard routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/listings/new" element={<MainLayout><ListingNew /></MainLayout>} />
                <Route path="/listings/:id/edit" element={<MainLayout><ListingEdit /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
              </Route>

              {/* Dashboard routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardIndex />} />
                  <Route path="bookings" element={<BookingsDashboard />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path="ai-tools" element={<AIToolsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
