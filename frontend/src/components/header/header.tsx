// src/components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    username: string;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <header className="dashboard-header">
            <h2>Olá, {username}</h2>
            <button className="logout-btn" onClick={handleLogout}>
                Logout
            </button>
        </header>
    );
};

export default Header;
