import React, { useState } from "react";
import "../../styles/form.scss";

interface Props {
    userId: number;
    onAddTransaction: (transaction: any) => void;
}

const RegisterTransactionForm: React.FC<Props> = ({ userId, onAddTransaction }) => {
    const [tipo, setTipo] = useState<"receita" | "despesa">("receita");
    const [date, setDate] = useState("");
    const [serviceType, setServiceType] = useState("Self-service");
    const [operationType, setOperationType] = useState<string[]>(["Lavagem"]); // para self-service pode ser ambos
    const [value, setValue] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Pix");
    const [descricao, setDescricao] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Para Self-service, permite múltiplos tipos de operação
    const handleOperationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setOperationType(selected);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!date || !value) {
            setError("Data e valor são obrigatórios");
            return;
        }

        if (tipo === "receita") {
            if (!serviceType || !paymentMethod) {
                setError("Todos os campos de receita são obrigatórios");
                return;
            }
            if (serviceType === "Self-service" && operationType.length === 0) {
                setError("Selecione pelo menos um tipo de ciclo para Self-service");
                return;
            }
        }

        if (tipo === "despesa" && !descricao) {
            setError("Descrição é obrigatória para despesas");
            return;
        }

            // Monta payload completo para backend, sempre enviando todos os campos esperados
            const payload: any = {
                userId,
                tipo,
                date,
                value: parseFloat(value),
                serviceType: tipo === "receita" ? serviceType : null,
                operationType: tipo === "receita"
                    ? (serviceType === "Self-service" ? operationType.join(", ") : "Lavagem")
                    : null,
                paymentMethod: tipo === "receita" ? paymentMethod : null,
                descricao: tipo === "despesa" ? descricao : null
            };

        // Log detalhado
        console.log("Payload enviado:", payload);

        try {
            const response = await fetch("http://localhost:3333/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                console.error("Erro backend:", data);
                throw new Error(data.error || "Erro ao registrar transação");
            }
            setSuccess("Transação registrada com sucesso!");
            setDate("");
            setValue("");
            setDescricao("");
                    const newTransaction = {
                        id: data.transaction.id,
                        tipo,
                        valor: Number(data.transaction.value),
                        date: data.transaction.date,
                        descricao: tipo === "despesa"
                            ? data.transaction.descricao // pega do backend, que já retorna o texto digitado
                            : `${data.transaction.operation_type} - ${data.transaction.service_type}`,
                        serviceType: tipo === "receita" ? data.transaction.service_type : ""
                    };
            onAddTransaction(newTransaction);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="form-container">
            <div className="form-box">
                <h2>Registrar Transação</h2>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <button
                        type="button"
                        className={tipo === "receita" ? "active" : ""}
                        onClick={() => setTipo("receita")}
                    >Receita</button>
                    <button
                        type="button"
                        className={tipo === "despesa" ? "active" : ""}
                        onClick={() => setTipo("despesa")}
                    >Despesa</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required />

                    {tipo === "receita" && (
                        <>
                            <input
                                type="number"
                                placeholder="Valor"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                step="0.01"
                                required
                            />
                            <select value={serviceType} onChange={e => setServiceType(e.target.value)}>
                                <option value="Self-service">Self-service</option>
                                <option value="Lavamos pra você">Lavamos pra você</option>
                            </select>
                            {serviceType === "Self-service" && (
                                <select
                                    multiple
                                    value={operationType}
                                    onChange={handleOperationTypeChange}
                                    style={{ minHeight: 60 }}
                                >
                                    <option value="Lavagem">Lavagem</option>
                                    <option value="Secagem">Secagem</option>
                                </select>
                            )}
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option value="Pix">Pix</option>
                                <option value="Débito">Débito</option>
                                <option value="Crédito">Crédito</option>
                            </select>
                        </>
                    )}

                    {tipo === "despesa" && (
                        <>
                            <input
                                type="number"
                                placeholder="Valor"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                step="0.01"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Descrição do gasto"
                                value={descricao}
                                onChange={e => setDescricao(e.target.value)}
                                required
                            />
                        </>
                    )}

                    <button type="submit">Registrar</button>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                </form>
            </div>
        </div>
    );
};

export default RegisterTransactionForm;
