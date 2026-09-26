import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { listAllOrders } from '../models/orderModel';
import { listUsers as listAllUsers } from '../models/userModel';

export const listUsers = async (_req: AuthRequest, res: Response) => {
  try {
    res.json(await listAllUsers());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listOrders = async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await listAllOrders();
    res.json(rows.map((row) => ({ ...row, amount: Number(row.amount) })));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
