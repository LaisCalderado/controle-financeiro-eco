import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SaldoCard from '../components/UI/SaldoCards';
import RegisterTransactionForm from '../components/forms/RegisterTransactionForm';
import axios from 'axios';

interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    date: string;
    tipo: 'entrada' | 'saida';
}

const Dashboard: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const fetchTransacoes = async () => {
            try {
                const response = await axios.get(`http://localhost:3333/dashboard/${userId}`);

                // Converte 'valor' para número
                const data = response.data.map((t: any) => ({
                    ...t,
                    valor: Number(t.valor), // <- aqui
                }));

                setTransacoes(data);
            } catch (error) {
                console.error('Erro ao buscar transações:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransacoes();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // --- Cálculos financeiros ---
    const totalReceita = transacoes
        .filter(t => t.tipo === 'entrada')
        .reduce((acc, t) => acc + t.valor, 0);

    const totalDespesas = transacoes
        .filter(t => t.tipo === 'saida')
        .reduce((acc, t) => acc + t.valor, 0);

    const saldoTotal = totalReceita - totalDespesas;

    const handleAddTransaction = (transaction: Transacao) => {
        setTransacoes(prev => [...prev, transaction]);
    };

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard do Usuário {userId}</h1>
            <button className='logout-btn' onClick={handleLogout}>Logout</button>

            <div className='dashboard-saldos'>
                <SaldoCard title="Saldo Total" amount={saldoTotal} color="green" />
                <SaldoCard title="Receita" amount={totalReceita} color="blue" />
                <SaldoCard title="Despesas" amount={totalDespesas} color="red" />
            </div>

            <RegisterTransactionForm userId={parseInt(userId!)} onAddTransaction={handleAddTransaction} />

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
                            <td>{t.descricao || "-"}</td>
                            <td>{t.valor !== undefined && t.valor !== null ? t.valor.toFixed(2) : "0.00"}</td>                            <td>{t.date ? new Date(t.date).toLocaleDateString() : "-"}</td>
                            <td>{t.tipo || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;
