import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

import LandingPage from './pages/public/LandingPage'
import HowItWorksPage from './pages/public/HowItWorksPage'
import NotFoundPage from './pages/public/NotFoundPage'
import ServerErrorPage from './pages/errors/ServerErrorPage'
import UnauthorizedPage from './pages/errors/UnauthorizedPage'

import RoleSelectionPage from './pages/auth/RoleSelectionPage'
import ProviderLoginPage from './pages/auth/ProviderLoginPage'
import ProviderRegisterPage from './pages/auth/ProviderRegisterPage'
import SeekerLoginPage from './pages/auth/SeekerLoginPage'
import SeekerRegisterPage from './pages/auth/SeekerRegisterPage'

import ProviderLayout from './layouts/ProviderLayout'
import ProviderDashboard from './pages/provider/ProviderDashboard'
import MyResourcesPage from './pages/provider/MyResourcesPage'
import AddResourcePage from './pages/provider/AddResourcePage'
import EditResourcePage from './pages/provider/EditResourcePage'
import AvailabilityPage from './pages/provider/AvailabilityPage'
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage'
import ProviderMessagesPage from './pages/provider/ProviderMessagesPage'
import ConditionReportsPage from './pages/provider/ConditionReportsPage'
import ProviderSettingsPage from './pages/provider/ProviderSettingsPage'

import SeekerLayout from './layouts/SeekerLayout'
import SeekerDashboard from './pages/seeker/SeekerDashboard'
import ExploreResourcesPage from './pages/seeker/ExploreResourcesPage'
import ResourceDetailsPage from './pages/seeker/ResourceDetailsPage'
import MyBookingsPage from './pages/seeker/MyBookingsPage'
import BookingDetailsPage from './pages/seeker/BookingDetailsPage'
import SeekerMessagesPage from './pages/seeker/SeekerMessagesPage'
import CheckInOutPage from './pages/seeker/CheckInOutPage'
import MyReportsPage from './pages/seeker/MyReportsPage'
import SeekerSettingsPage from './pages/seeker/SeekerSettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />

          {/* Role selection */}
          <Route path="/role-selection" element={<RoleSelectionPage />} />

          {/* Provider authentication */}
          <Route path="/login/provider" element={<ProviderLoginPage />} />
          <Route path="/register/provider" element={<ProviderRegisterPage />} />

          {/* Seeker authentication */}
          <Route path="/login/seeker" element={<SeekerLoginPage />} />
          <Route path="/register/seeker" element={<SeekerRegisterPage />} />

          {/* Provider protected workspace */}
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRole="provider">
                <ProviderLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProviderDashboard />} />
            <Route path="resources" element={<MyResourcesPage />} />
            <Route path="resources/new" element={<AddResourcePage />} />
            <Route path="resources/edit/:id" element={<EditResourcePage />} />
            <Route path="resources/:id/edit" element={<EditResourcePage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="bookings" element={<ProviderBookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailsPage />} />
            <Route path="messages" element={<ProviderMessagesPage />} />
            <Route path="reports" element={<ConditionReportsPage />} />
            <Route path="settings" element={<ProviderSettingsPage />} />
          </Route>

          {/* Seeker protected workspace */}
          <Route
            path="/seeker"
            element={
              <ProtectedRoute allowedRole="seeker">
                <SeekerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SeekerDashboard />} />
            <Route path="explore" element={<ExploreResourcesPage />} />
            <Route path="resources/:id" element={<ResourceDetailsPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailsPage />} />
            <Route path="messages" element={<SeekerMessagesPage />} />
            <Route path="check-in/:id" element={<CheckInOutPage />} />
            <Route path="reports" element={<MyReportsPage />} />
            <Route path="settings" element={<SeekerSettingsPage />} />
          </Route>

          {/* Error pages */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/server-error" element={<ServerErrorPage />} />

          {/* Backward-compatible aliases */}
          <Route
            path="/provider/login"
            element={<Navigate to="/login/provider" replace />}
          />
          <Route
            path="/provider/register"
            element={<Navigate to="/register/provider" replace />}
          />
          <Route
            path="/seeker/login"
            element={<Navigate to="/login/seeker" replace />}
          />
          <Route
            path="/seeker/register"
            element={<Navigate to="/register/seeker" replace />}
          />

          {/* Unknown pages */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  )
}
