import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/form.scss";

export default function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:3333/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error ao fazer login");

            alert("Login realizado com sucesso!");
            console.log("Token JWT: ", data.token);

            // Aqui você redireciona para o dashboard
            // Se você tiver o ID do usuário no retorno, use: data.userId
            const userId = data.user?.id || 1; // exemplo
            navigate(`/dashboard/${data.user.id}`);

            // Exemplo: salva o token no localStorage
            localStorage.setItem("token", data.token);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="form-container">
            <div className="form-box">
                <h2>Entrar</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">Entrar</button>
                    {error && <div className="error">{error}</div>}
                </form>
            </div>
        </div>
    );
}