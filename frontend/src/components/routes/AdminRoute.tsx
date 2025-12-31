// src/components/routes/AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, isAdmin } = useAuth();

    if (!user) {
        // Se não estiver logado, redireciona para login
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        // Se não for admin, redireciona para dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
