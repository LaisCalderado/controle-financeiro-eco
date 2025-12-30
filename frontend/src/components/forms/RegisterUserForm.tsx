import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

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
    
    setIsLoading(true);
    
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
      }, 1500);
      
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
      
      if (onRegister) onRegister(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Criar Conta</h2>
            <p className="text-slate-500">Preencha os dados para cadastrar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Senha Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Confirmar Senha Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Cadastrando...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Cadastrar</span>
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao login</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Sistema de Controle Financeiro ECO
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterUserForm;
