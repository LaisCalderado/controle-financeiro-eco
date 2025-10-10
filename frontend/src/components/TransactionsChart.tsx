import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    transacoes: {
        id: number;
        descricao: string;
        valor: number;
        date: string;
        tipo: "entrada" | "saida";
        serviceType: string;
    }[];
}

const TransactionsChart: React.FC<Props> = ({ transacoes }) => {
    // Filtra os tipos
    const selfService = transacoes.filter(t => t.descricao.includes("Self-service"));
    const lavamosPraVoce = transacoes.filter(t => t.descricao.includes("Lavamos pra você"));

    const data = {
        labels: ["Self-service", "Lavamos pra você"],
        datasets: [
            {
                label: "Total em R$",
                data: [
                    selfService.reduce((acc, t) => acc + t.valor, 0),
                    lavamosPraVoce.reduce((acc, t) => acc + t.valor, 0)
                ],
                backgroundColor: ["#4caf50", "#2196f3"]
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const
            },
            title: {
                display: true,
                text: "Transações por Tipo de Serviço"
            }
        }
    };

    return <Bar data={data} options={options} />;
};

export default TransactionsChart;
