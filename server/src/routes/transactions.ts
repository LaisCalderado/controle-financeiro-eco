import { Router } from "express";
import { pool } from "../db";

const router = Router();

//Registrar nova transação
router.post('/transactions', async (req, res) => {
    const { userId, date, serviceType, operationType, value, paymentMethod } = req.body;

    if (!userId || !date || !serviceType || !operationType || !value || !paymentMethod) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
        const query = `INSERT INTO transactions (user_id, date, service_type, operation_type, value, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `;

        const values = [userId, date, serviceType, operationType, value, paymentMethod];
        const result = await pool.query(query, values);

        res.status(200).json({ transaction: result.rows[0] });

    } catch (err) {
        console.error("Erro aosalvar transação", err);
        res.status(500).json({ error: "Errorao salvar transação" });

    }
});

export default router;