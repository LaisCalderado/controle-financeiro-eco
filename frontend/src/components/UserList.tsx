// src/components/UserList.tsx
import React, { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://controle-financeiro-eco-back.onrender.com/auth/users');
                const data = await response.json();
                if (!response.ok) {
                    setError(data.error || 'Erro ao buscar usuários');
                    return;
                }
                setUsers(data);
            } catch (err) {
                console.error(err);
                setError('Erro ao buscar usuários');
            }
        };

        fetchUsers();
    }, []);

    return (
        <div style={{ marginTop: 20 }}>
            <h2>Usuários cadastrados</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
