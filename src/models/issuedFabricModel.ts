import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface IssuedFabric {
  PK: string;
  SK: string;
  fabricName: string;
  totalIssuedLength: number;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssuedFabricData {
  fabricName: string;
  issuedLength: number;
}

class IssuedFabricModel {
  private static tableName = process.env.TABLE_NAME || 'fabricTable';

  static async getByName(fabricName: string): Promise<IssuedFabric | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `ISSUED#${fabricName}`,
        SK: `ISSUED#${fabricName}`,
      },
    });

    const result = await docClient.send(command);
    return result.Item as IssuedFabric || null;
  }

  static async create(data: CreateIssuedFabricData): Promise<IssuedFabric> {
    const issuedFabric: IssuedFabric = {
      PK: `ISSUED#${data.fabricName}`,
      SK: `ISSUED#${data.fabricName}`,
      fabricName: data.fabricName,
      totalIssuedLength: data.issuedLength,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: issuedFabric,
    });

    await docClient.send(command);
    return issuedFabric;
  }

  static async addIssuedLength(fabricName: string, issuedLength: number): Promise<IssuedFabric> {
    const existing = await this.getByName(fabricName);

    if (!existing) {
      return this.create({ fabricName, issuedLength });
    }

    const newTotalLength = existing.totalIssuedLength + issuedLength;

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: `ISSUED#${fabricName}`,
        SK: `ISSUED#${fabricName}`,
      },
      UpdateExpression: 'SET totalIssuedLength = :total, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':total': newTotalLength,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return result.Attributes as IssuedFabric;
  }

  static async getAll(): Promise<IssuedFabric[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: {
        ':pk': 'ISSUED#',
      },
    });

    const result = await docClient.send(command);
    return result.Items as IssuedFabric[] || [];
  }

  static async assignType(fabricName: string, type: string): Promise<IssuedFabric> {
    const existing = await this.getByName(fabricName);
    if (!existing) {
      throw new Error('Issued fabric not found');
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: `ISSUED#${fabricName}`,
        SK: `ISSUED#${fabricName}`,
      },
      UpdateExpression: 'SET #type = :type, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':type': type,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return result.Attributes as IssuedFabric;
  }
}

export default IssuedFabricModel;
