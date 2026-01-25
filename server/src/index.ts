import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import transactionRouter from './routes/transactions';
import setupRoutes from './routes/setup';
import recorrentesRoutes from './routes/recorrentes';
import parceladasRoutes from './routes/parceladas';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Controle Financeiro - Backend Online' });
});

app.use('/api/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api', transactionRouter);
app.use('/api/recorrentes', recorrentesRoutes);
app.use('/api/parceladas', parceladasRoutes);
app.use('/setup', setupRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
