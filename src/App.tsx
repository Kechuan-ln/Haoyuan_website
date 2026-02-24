import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import PortalLayout from '@/components/layout/PortalLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import ManagerGuard from '@/components/shared/ManagerGuard'

// ---------- Public pages ----------
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const ServicesPage = lazy(() => import('@/pages/public/ServicesPage'))
const ServiceDetailPage = lazy(() => import('@/pages/public/ServiceDetailPage'))
const ProjectsPage = lazy(() => import('@/pages/public/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/public/ProjectDetailPage'))
const TeamPage = lazy(() => import('@/pages/public/TeamPage'))
const QualificationsPage = lazy(() => import('@/pages/public/QualificationsPage'))
const NewsPage = lazy(() => import('@/pages/public/NewsPage'))
const NewsDetailPage = lazy(() => import('@/pages/public/NewsDetailPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))

// ---------- Bidding pages ----------
const BidHallPage = lazy(() => import('@/pages/bidding/BidHallPage'))
const BidDetailPage = lazy(() => import('@/pages/bidding/BidDetailPage'))

// ---------- Auth pages ----------
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// ---------- Vendor pages ----------
const VendorDashboardPage = lazy(() => import('@/pages/vendor/VendorDashboardPage'))
const VendorRegisterPage = lazy(() => import('@/pages/vendor/VendorRegisterPage'))
const VendorMyBidsPage = lazy(() => import('@/pages/vendor/VendorMyBidsPage'))
const BidSubmissionPage = lazy(() => import('@/pages/vendor/BidSubmissionPage'))
const BidResultPage = lazy(() => import('@/pages/vendor/BidResultPage'))

// ---------- Admin pages ----------
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const ArticleListPage = lazy(() => import('@/pages/admin/ArticleListPage'))
const ArticleEditorPage = lazy(() => import('@/pages/admin/ArticleEditorPage'))
const ProjectManagePage = lazy(() => import('@/pages/admin/ProjectManagePage'))
const VendorManagePage = lazy(() => import('@/pages/admin/VendorManagePage'))
const BidManagePage = lazy(() => import('@/pages/admin/BidManagePage'))
const BidEvaluationPage = lazy(() => import('@/pages/admin/BidEvaluationPage'))
const EvaluationReportPage = lazy(() => import('@/pages/admin/EvaluationReportPage'))
const ContactManagePage = lazy(() => import('@/pages/admin/ContactManagePage'))
const ServiceManagePage = lazy(() => import('@/pages/admin/ServiceManagePage'))
const TeamContentPage = lazy(() => import('@/pages/admin/TeamContentPage'))
const AboutContentPage = lazy(() => import('@/pages/admin/AboutContentPage'))
const HomeContentPage = lazy(() => import('@/pages/admin/HomeContentPage'))
const UserManagePage = lazy(() => import('@/pages/admin/UserManagePage'))
const SiteSettingsPage = lazy(() => import('@/pages/admin/SiteSettingsPage'))
const QualificationsManagePage = lazy(() => import('@/pages/admin/QualificationsManagePage'))

// ---------- Special pages ----------
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes under PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="qualifications" element={<QualificationsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<NewsDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="bidding" element={<BidHallPage />} />
            <Route path="bidding/:id" element={<BidDetailPage />} />
          </Route>

          {/* Auth routes (no layout) */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Vendor routes under PortalLayout, protected for vendor role */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route element={<PortalLayout />}>
              <Route path="vendor/dashboard" element={<VendorDashboardPage />} />
              <Route path="vendor/register" element={<VendorRegisterPage />} />
              <Route path="vendor/my-bids" element={<VendorMyBidsPage />} />
              <Route path="vendor/bid/:id/submit" element={<BidSubmissionPage />} />
              <Route path="vendor/bid/:id/result" element={<BidResultPage />} />
            </Route>
          </Route>

          {/* Admin routes under AdminLayout, protected for admin role */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/articles" element={<ArticleListPage />} />
              <Route path="admin/articles/new" element={<ArticleEditorPage />} />
              <Route path="admin/articles/:id/edit" element={<ArticleEditorPage />} />
              <Route path="admin/projects" element={<ProjectManagePage />} />
              <Route path="admin/services" element={<ServiceManagePage />} />
              <Route path="admin/team" element={<TeamContentPage />} />
              <Route path="admin/about" element={<AboutContentPage />} />
              <Route path="admin/home" element={<HomeContentPage />} />
              <Route path="admin/vendors" element={<ManagerGuard><VendorManagePage /></ManagerGuard>} />
              <Route path="admin/bids" element={<BidManagePage />} />
              <Route path="admin/bids/:id/evaluate" element={<ManagerGuard><BidEvaluationPage /></ManagerGuard>} />
              <Route path="admin/bids/:id/report" element={<ManagerGuard><EvaluationReportPage /></ManagerGuard>} />
              <Route path="admin/qualifications" element={<QualificationsManagePage />} />
              <Route path="admin/contacts" element={<ContactManagePage />} />
              <Route path="admin/users" element={<ManagerGuard><UserManagePage /></ManagerGuard>} />
              <Route path="admin/settings" element={<ManagerGuard><SiteSettingsPage /></ManagerGuard>} />
            </Route>
          </Route>

          {/* Reviewer routes under AdminLayout, protected for admin or reviewer */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'reviewer']} />}>
            <Route element={<AdminLayout />}>
              <Route path="admin/bids/:id/evaluate" element={<BidEvaluationPage />} />
              <Route path="admin/bids/:id/report" element={<EvaluationReportPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
