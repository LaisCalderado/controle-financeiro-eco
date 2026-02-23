import React, { useState } from "react";
import { api } from "../../services/api";

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

        const valorNumerico = parseFloat(value);
        const tipoServico =
            tipo === "receita"
                ? serviceType === "Self-service"
                    ? "selfservice"
                    : "completo"
                : undefined;

        const categoriaReceita =
            tipo === "receita"
                ? serviceType === "Self-service"
                    ? (operationType[0]?.toLowerCase() || "outros")
                    : "lavagem"
                : "outros";

        const descricaoFinal =
            tipo === "despesa"
                ? descricao
                : serviceType === "Self-service"
                    ? `Receita ${operationType.join(" + ")}`
                    : "Receita Serviço Completo";

        const payload: any = {
            data: date,
            valor: valorNumerico,
            tipo,
            categoria: categoriaReceita,
            descricao: descricaoFinal,
            tipo_servico: tipoServico,
            paymentMethod: tipo === "receita" ? paymentMethod : null
        };

        // Log detalhado
        console.log("Payload enviado:", payload);

        try {
            const response = await api.post('/api/transactions', payload);
            const data = response.data;

            setSuccess("Transação registrada com sucesso!");
            setDate("");
            setValue("");
            setDescricao("");
                    const newTransaction = {
                        id: data.id,
                        tipo,
                        valor: Number(data.valor),
                        date: data.data,
                        descricao: tipo === "despesa"
                            ? data.descricao
                            : data.descricao,
                        serviceType: tipo === "receita" ? data.tipo_servico : ""
                    };
            onAddTransaction(newTransaction);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="form-container">
            <div className="form-box">
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
