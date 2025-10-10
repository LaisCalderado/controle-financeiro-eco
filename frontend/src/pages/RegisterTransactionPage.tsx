import React from "react";
import RegisterTransactionForm from "../components/forms/RegisterTransactionForm";
import { useParams, useNavigate } from "react-router-dom";

const RegisterTransactionPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    if (!userId) return <p>Usuário não encontrado</p>;

    return (
        <div className="form-container">
            <h2>Registrar Nova Transação</h2>
            <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem", backgroundColor: "#2563eb", color: "white" }}>Voltar</button>
            <RegisterTransactionForm
                userId={parseInt(userId)}
                onAddTransaction={() => navigate(`/dashboard/${userId}`)}
            />
        </div>

    );
};

export default RegisterTransactionPage;
