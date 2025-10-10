import { Router } from "express";
import { pool } from "../db";

const router = Router();

// Registrar nova transação
router.post('/transactions', async (req, res) => {
    console.log('REQ.BODY:', req.body);
    const { userId, date, serviceType, operationType, value, paymentMethod, descricao, tipo } = req.body;

    // Campos obrigatórios comuns
    if (
        userId == null ||
        userId === "" ||
        !date ||
        value == null ||
        value === "" ||
        !tipo
    ) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    if (tipo === "receita") {
        // Campos obrigatórios apenas para receita
        if (!serviceType || !operationType || !paymentMethod) {
            return res.status(400).json({ error: "Campos obrigatórios para receita ausentes" });
        }
    }

    if (tipo === "despesa") {
        // Campos obrigatórios apenas para despesa
        if (!descricao) {
            return res.status(400).json({ error: "Descrição é obrigatória para despesas" });
        }
    }

    try {
        const query = `INSERT INTO transactions (user_id, date, service_type, operation_type, value, payment_method, descricao, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`;
        const values = [
            userId,
            date,
            tipo === "receita" ? serviceType : null,
            tipo === "receita" ? operationType : null,
            value,
            tipo === "receita" ? paymentMethod : null,
            tipo === "despesa" ? descricao : null,
            tipo
        ];
        const result = await pool.query(query, values);
        res.status(200).json({ transaction: result.rows[0] });
    } catch (err) {
        console.error("Erro ao salvar transação", err);
        res.status(500).json({ error: "Erro ao salvar transação" });
    }
});


export default router;
