import { Request, Response } from 'express';
import TransactionModel from '../models/transactionModel';

export async function getAllTransactions(_req: Request, res: Response): Promise<void> {
  try {
    const transactions = await TransactionModel.getAll();
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting all transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
