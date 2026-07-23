import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to={ROUTES.HOME} replace />;
  if (adminOnly && !isAdmin) return <Navigate to={ROUTES.HOME} replace />;

  return children;
};

export default ProtectedRoute;
