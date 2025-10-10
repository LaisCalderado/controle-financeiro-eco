import React from "react";
import RegisterTransactionForm from "../components/forms/RegisterTransactionForm";
import { useParams, useNavigate } from "react-router-dom";

const RegisterTransactionPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    if (!userId) return <p>Usuário não encontrado</p>;

    return (
        <div>
            <h1>Registrar Nova Transação</h1>
            <button onClick={() => navigate(-1)}>Voltar</button>
            <RegisterTransactionForm
                userId={parseInt(userId)}
                onAddTransaction={() => navigate(`/dashboard/${userId}`)}
            // Redireciona para dashboard após criar transação
            />
        </div>
    );
};

export default RegisterTransactionPage;
