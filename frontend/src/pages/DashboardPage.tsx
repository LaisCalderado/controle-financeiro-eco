import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SaldoCard from '../components/UI/SaldoCards';
import TransactionsChart from '../components/TransactionsChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    date: string;
    tipo: 'entrada' | 'saida';
    serviceType: string;
    paymentMethod?: string;
}

const DashboardPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTransacoes = React.useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3333/dashboard/${userId}`);

            const data: Transacao[] = response.data.map((t: any) => ({
                id: t.id,
                descricao: t.descricao
                    ? t.descricao
                    : `${t.operation_type || ""} - ${t.service_type || ""}`,
                valor: Number(t.value || t.valor) || 0,
                date: t.date || t.createdAt || "-",
                tipo: t.tipo === 'receita' ? 'entrada'
                    : t.tipo === 'despesa' ? 'saida'
                    : t.operation_type === "Lavagem" || t.operation_type === "Self-service"
                        ? "entrada"
                        : "saida",
                paymentMethod: t.payment_method || t.paymentMethod || ""
            }));

            setTransacoes(data);
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchTransacoes(); }, [fetchTransacoes]);

    const totalReceita = transacoes
        .filter(t => t.tipo === 'entrada')
        .reduce((acc, t) => acc + t.valor, 0);

    const totalDespesas = transacoes
        .filter(t => t.tipo === 'saida')
        .reduce((acc, t) => acc + t.valor, 0);

    const saldoTotal = totalReceita - totalDespesas;

    if (loading) return <p>Carregando...</p>;

    // --- Dados para o gráfico ---
    const chartData = {
        labels: ['Saldo Total', 'Receita', 'Despesas'],
        datasets: [
            {
                label: 'R$',
                data: [saldoTotal, totalReceita, totalDespesas],
                backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                borderRadius: 6,
            },
        ],
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard do Usuário {userId}</h1>
                <div>
                    <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                        Logout
                    </button>
                    <button className="add-transaction-btn" onClick={() => navigate(`/controle-diario`)}>
                        + Nova Transação
                    </button>
                </div>
            </div>

            <div className='dashboard-saldos'>
                <SaldoCard title="Saldo Total" amount={saldoTotal} color="green" />
                <SaldoCard title="Receita" amount={totalReceita} color="blue" />
                <SaldoCard title="Despesas" amount={totalDespesas} color="red" />
            </div>

            <div className="chart-container">
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="dashboard-charts">
                <TransactionsChart transacoes={transacoes} />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Método</th>
                    </tr>
                </thead>
                <tbody>
                    {transacoes.map(t => (
                        <tr key={t.id}>
                            <td>{t.descricao}</td>
                            <td>{!isNaN(t.valor) ? t.valor.toFixed(2) : "0.00"}</td>
                            <td>{t.date !== "-" ? new Date(t.date).toLocaleDateString() : "-"}</td>
                            <td>{t.tipo}</td>
                            <td>{t.tipo === 'entrada' ? t.paymentMethod : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardPage;
