import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/form.scss';

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
  const response = await fetch('https://controle-financeiro-eco-back.onrender.com/api/auth/register', {
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
    <div className="form-container">
      <div className="form-box">
        <h2>Cadastrar Usuário</h2>
        <form onSubmit={handleSubmit}>
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
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" style={{ flex: 1 }}>
              Cadastrar
            </button>
            <button
              type="button"
              style={{ flex: 1 }}
              onClick={() => navigate('/')}
            >
              Voltar ao login
            </button>
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </form>
      </div>

    </div>
  );
};

export default RegisterUserForm;
