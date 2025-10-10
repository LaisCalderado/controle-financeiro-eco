import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/_forms.scss';

interface RegisterUserFormProps {
  onRegister?: (user: any) => void;
}

const RegisterUserForm: React.FC<RegisterUserFormProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!nome || !email || !senha || !confirmarSenha) {
      setError('Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3333/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, email, password: senha })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar usuário');
      }
      setSuccess('Usuário cadastrado com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 1200);
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
      if (onRegister) onRegister(data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form className="register-user-form" onSubmit={handleSubmit}>
      <h2>Cadastrar Usuário</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={e => setNome(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirmar Senha"
        value={confirmarSenha}
        onChange={e => setConfirmarSenha(e.target.value)}
        required
      />
      <button type="submit">Cadastrar</button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </form>
  );
};

export default RegisterUserForm;
