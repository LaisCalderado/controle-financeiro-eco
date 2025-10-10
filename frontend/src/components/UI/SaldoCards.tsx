import Card from "./Card";

interface SaldoCardProps {
    title: string;
    amount: number;
    color?: string; // opcional: cor do card
}

const SaldoCard = ({ title, amount, color }: SaldoCardProps) => {
    return (
        <Card className="saldo-card">
            <h3>{title}</h3>
            <p style={{ color: color || "black" }}>{amount.toFixed(2)}</p>
        </Card>
    );
};

export default SaldoCard;
