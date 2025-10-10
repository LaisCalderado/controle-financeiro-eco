import React, { useState } from "react";
import "../../styles/components/_forms.scss";

interface Props {
    userId: number;
    onAddTransaction: (transaction: any) => void;
}

const RegisterTransactionForm: React.FC<Props> = ({ userId, onAddTransaction }) => {
    const [date, setDate] = useState("");
    const [serviceType, setServiceType] = useState("Self-service");
    const [operationType, setOperationType] = useState("Lavagem");
    const [value, setValue] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Pix");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    let valorFinal = parseFloat(value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!date || !serviceType || !operationType || !value || !paymentMethod) {
            setError("Todos os campos são obrigatórios");
            return;
        }

        try {
            const response = await fetch("http://localhost:3333/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    date,
                    serviceType,
                    operationType,
                    value: parseFloat(value),
                    paymentMethod,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao registrar transação");

            setSuccess("Transação registrada com sucesso!");
            setDate("");
            setValue("");

            if (serviceType === "Lavamos pra voce" || serviceType === "Lavamos pra você" ){
                valorFinal += 15;
            }

            const newTransaction = {
                id: data.transaction.id,
                descricao: `${operationType} - ${serviceType}`,
                valor: valorFinal,
                date: data.transaction.date,
                tipo: operationType === "Lavagem" ? "entrada" : "saida",
                serviceType, // <- adiciona aqui
            };

            onAddTransaction(newTransaction);

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="form-container">
            <div className="form-box">
                <h2>Registrar Serviço</h2>
                <form onSubmit={handleSubmit}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />

                    <select value={serviceType} onChange={e => setServiceType(e.target.value)}>
                        <option value="Self-service">Self-service</option>
                        <option value="Lavamos pra você">Lavamos pra você</option>
                    </select>

                    <select value={operationType} onChange={e => setOperationType(e.target.value)}>
                        <option value="Lavagem">Lavagem</option>
                        <option value="Secagem">Secagem</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Valor"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        step="0.01"
                    />

                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        <option value="Pix">Pix</option>
                        <option value="Débito">Débito</option>
                        <option value="Crédito">Crédito</option>
                    </select>

                    <button type="submit">Registrar</button>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                </form>
            </div>
        </div>

    );
};

export default RegisterTransactionForm;
