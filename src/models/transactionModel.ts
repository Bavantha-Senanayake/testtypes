import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface Transaction {
  PK: string;
  SK: string;
  transactionId: string;
  fabricName: string;
  issuedLength: number;
  createdAt: string;
}

export interface CreateTransactionData {
  fabricName: string;
  issuedLength: number;
}

class TransactionModel {
  private static tableName = process.env.TABLE_NAME || 'fabricTable';

  static async create(data: CreateTransactionData): Promise<Transaction> {
    const transactionId = uuidv4();
    const transaction: Transaction = {
      PK: `TRANSACTION#${transactionId}`,
      SK: `TRANSACTION#${transactionId}`,
      transactionId,
      fabricName: data.fabricName,
      issuedLength: data.issuedLength,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: transaction,
    });

    await docClient.send(command);
    return transaction;
  }

  static async getAll(): Promise<Transaction[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: {
        ':pk': 'TRANSACTION#',
      },
    });

    const result = await docClient.send(command);
    return result.Items as Transaction[] || [];
  }
}

export default TransactionModel;
