import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const token = localStorage.getItem('token'); // verifica se há token

    if (!token) {
        return <Navigate to="/" replace />; // se não houver token, redireciona para login
    }

    return children; // se houver token, permite acesso à rota
};

export default PrivateRoute;
