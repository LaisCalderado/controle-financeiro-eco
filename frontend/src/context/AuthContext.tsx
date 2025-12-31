// src/context/AuthContext.tsx
import { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        // Carrega usuário do localStorage ao inicializar
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
