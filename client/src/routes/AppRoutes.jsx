import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PublishedPage from '../pages/PublishedPage';
import SharedPage from '../pages/SharedPage';
import DocumentDetailsPage from '../pages/DocumentDetailsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import AuditLogPage from '../pages/AuditLogPage';

function Protected({ children, admin }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-10">Loading session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="published" element={<PublishedPage />} />
        <Route path="shared" element={<SharedPage />} />
        <Route path="documents/:id" element={<DocumentDetailsPage />} />
        <Route
          path="admin"
          element={
            <Protected admin>
              <AdminDashboardPage />
            </Protected>
          }
        />
        <Route
          path="admin/users"
          element={
            <Protected admin>
              <UserManagementPage />
            </Protected>
          }
        />
        <Route
          path="admin/audit"
          element={
            <Protected admin>
              <AuditLogPage />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
