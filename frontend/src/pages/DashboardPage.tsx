import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SaldoCard from '../components/UI/SaldoCards';
import axios from 'axios';

interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    date: string;
    tipo: 'entrada' | 'saida';
}

const DashboardPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTransacoes = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3333/dashboard/${userId}`);

            const data: Transacao[] = response.data.map((t: any) => ({
                id: t.id,
                descricao: t.description || `${t.operation_type || ""} - ${t.service_type || ""}`,
                valor: Number(t.value || t.valor) || 0,
                date: t.date || t.createdAt || "-",
                tipo: t.tipo
                    ? t.tipo
                    : t.operation_type === "Lavagem" || t.operation_type === "Self-service"
                        ? "entrada"
                        : "saida",
            }));

            setTransacoes(data);
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransacoes();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // --- cálculos financeiros ---
    const totalReceita = transacoes
        .filter(t => t.tipo === 'entrada')
        .reduce((acc, t) => acc + t.valor, 0);

    const totalDespesas = transacoes
        .filter(t => t.tipo === 'saida')
        .reduce((acc, t) => acc + t.valor, 0);

    const saldoTotal = totalReceita - totalDespesas;

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard do Usuário {userId}</h1>
            <button className='logout-btn' onClick={handleLogout}>Logout</button>
            <button onClick={() => navigate(`/transactions/${userId}`)}>
                Registrar Nova Transação
            </button>

            <div className='dashboard-saldos'>
                <SaldoCard title="Saldo Total" amount={saldoTotal} color="green" />
                <SaldoCard title="Receita" amount={totalReceita} color="blue" />
                <SaldoCard title="Despesas" amount={totalDespesas} color="red" />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {transacoes.map(t => (
                        <tr key={t.id}>
                            <td>{t.descricao}</td>
                            <td>{!isNaN(t.valor) ? t.valor.toFixed(2) : "0.00"}</td>
                            <td>{t.date !== "-" ? new Date(t.date).toLocaleDateString() : "-"}</td>
                            <td>{t.tipo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardPage;
