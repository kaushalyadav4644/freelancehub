import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/public/HomePage';
import JobListingsPage from './pages/public/JobListingsPage';
import JobDetailPage from './pages/public/JobDetailPage';
import FreelancersPage from './pages/public/FreelancersPage';
import FreelancerProfilePage from './pages/public/FreelancerProfilePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Client Pages
import PostJobPage from './pages/client/PostJobPage';
import ManageJobsPage from './pages/client/ManageJobsPage';
import JobApplicationsPage from './pages/client/JobApplicationsPage';
import ClientProjectsPage from './pages/client/ClientProjectsPage';

// Freelancer Pages
import MyApplicationsPage from './pages/freelancer/MyApplicationsPage';
import MyProjectsPage from './pages/freelancer/MyProjectsPage';
import EditProfilePage from './pages/freelancer/EditProfilePage';

// Shared Pages
import ProjectDetailPage from './pages/shared/ProjectDetailPage';
import PaymentsPage from './pages/shared/PaymentsPage';
import MessagesPage from './pages/shared/MessagesPage';
import DashboardPage from './pages/shared/DashboardPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminReports from './pages/admin/AdminReports';

// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />

          {/* Auth */}
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Client */}
          <Route path="/post-job" element={<ProtectedRoute roles={['client']}><PostJobPage /></ProtectedRoute>} />
          <Route path="/manage-jobs" element={<ProtectedRoute roles={['client']}><ManageJobsPage /></ProtectedRoute>} />
          <Route path="/jobs/:id/applications" element={<ProtectedRoute roles={['client']}><JobApplicationsPage /></ProtectedRoute>} />
          <Route path="/client/projects" element={<ProtectedRoute roles={['client']}><ClientProjectsPage /></ProtectedRoute>} />

          {/* Freelancer */}
          <Route path="/my-applications" element={<ProtectedRoute roles={['freelancer']}><MyApplicationsPage /></ProtectedRoute>} />
          <Route path="/my-projects" element={<ProtectedRoute roles={['freelancer']}><MyProjectsPage /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
