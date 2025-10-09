// src/components/forms/RegisterForm.tsx
import React, { useState } from 'react';

const RegisterForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); // limpa mensagem anterior

        try {
            const response = await fetch('http://localhost:3333/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Mostra erro retornado pelo back
                setMessage(data.error);
                console.error('Erro:', data);
                return;
            }

            // Sucesso
            setMessage(`Usuário ${data.name} cadastrado com sucesso!`);
            console.log('Usuário cadastrado:', data);

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
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <h2>Cadastro de Usuário</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Cadastrar</button>
            </form>

            {message && (
                <p style={{ marginTop: 10, color: message.includes('sucesso') ? 'green' : 'red' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default RegisterForm;
