import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    data: string;
    tipo: 'entrada' | 'saida';
}

const Dashboard: React.FC = () => {
    const { userId } = useParams<{ userId: string }>(); // pega o userId da URL
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return; // evita requisição sem userId

        const fetchTransacoes = async () => {
            try {
                const response = await axios.get(`http://localhost:3333/dashboard/${userId}`);
                setTransacoes(response.data);
            } catch (error) {
                console.error('Erro ao buscar transações:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransacoes();
    }, [userId]);

    const handleLogout = () => {
        // remove o token do localStorage
        localStorage.removeItem('token');
        // redireciona para a página de login
        navigate('/');
    }

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard do Usuário {userId}</h1>
            <button className='logout-btn' onClick={handleLogout}>
                Logout
            </button>
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
                            <td>{t.valor.toFixed(2)}</td>
                            <td>{new Date(t.data).toLocaleDateString()}</td>
                            <td>{t.tipo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;
