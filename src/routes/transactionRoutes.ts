import express from 'express';
import * as transactionController from '../controllers/transactionController';

const router = express.Router();

router.get('/', transactionController.getAllTransactions);

export default router;
