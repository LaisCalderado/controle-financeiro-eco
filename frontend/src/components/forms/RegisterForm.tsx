// src/components/forms/RegisterForm.tsx
import React, { useState } from 'react';
import { api } from '../../services/api';

const RegisterForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); // limpa mensagem anterior

        try {
            const response = await api.post('/api/auth/register', {
                name,
                email,
                password
            });

            if (!response.data) {
                setMessage('Erro ao cadastrar usuário');
                return;
            }

            // Sucesso
            setMessage(`Usuário ${response.data.name} cadastrado com sucesso!`);
            console.log('Usuário cadastrado:', response.data);

            // Limpa os campos
            setName('');
            setEmail('');
            setPassword('');

        } catch (error) {
            console.error('Erro ao enviar requisição:', error);
            setMessage('Erro ao cadastrar usuário');
        }
    };

    return (
        <div className="register-page">
            <div className="register-form">
                <h2>Cadastro de Usuário</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Nome:</label>
                        <input
                            type="text"
                            placeholder='Nome'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder='E-mail'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Senha:</label>
                        <input
                            type="password"
                            placeholder='Senha'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Cadastrar</button>
                </form>

                {message && (
                    <p className={message.includes('sucesso') ? 'success' : 'error'}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RegisterForm;
