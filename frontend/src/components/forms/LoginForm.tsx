import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, UserPlus, Sparkles } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await api.post("/api/auth/login", { email, password });

            if (!response.data.token) throw new Error("Erro ao fazer login");

            console.log("Token JWT: ", response.data.token);
            console.log("User data: ", response.data.user);

            // Salva o token no localStorage
            localStorage.setItem("token", response.data.token);
            
            // Salva o usuário no contexto (incluindo role)
            login(response.data.user);

            // Redireciona para o dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Erro ao fazer login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo</h2>
                        <p className="text-slate-500">Faça login para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all font-medium shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span>Entrando...</span>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Entrar</span>
                                </>
                            )}
                        </button>

                        {/* Register Button */}
                        <button
                            type="button"
                            onClick={() => navigate('/register-user')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Criar nova conta</span>
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
}