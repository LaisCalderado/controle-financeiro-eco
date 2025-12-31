// src/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            userId?: number;
            userEmail?: string;
            userRole?: string;
        }
    }
}

// Middleware para verificar se o usuário está autenticado
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta') as JwtPayload;
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.userRole = decoded.role || 'user';
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

// Middleware para verificar se o usuário é admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
    }
    next();
};
