import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface Fabric {
  PK: string; // e.g., FABRIC#<name>
  SK: string; // e.g., FABRIC#<name>
  name: string;
  length: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFabricData {
  name: string;
  length: number;
}

class FabricModel {
  private static tableName = process.env.TABLE_NAME || 'testTable';

  static async create(data: CreateFabricData): Promise<Fabric> {
    // Check if name already exists
    const existing = await this.getByName(data.name);
    if (existing) {
      throw new Error('Fabric with this name already exists');
    }

    const fabric: Fabric = {
      PK: `FABRIC#${data.name}`,
      SK: `FABRIC#${data.name}`,
      name: data.name,
      length: data.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: fabric,
    });

    await docClient.send(command);
    return fabric;
  }

  static async getById(name: string): Promise<Fabric | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `FABRIC#${name}`,
        SK: `FABRIC#${name}`,
      },
    });

    const result = await docClient.send(command);
    return result.Item as Fabric || null;
  }

  static async getByName(name: string): Promise<Fabric | null> {
    return this.getById(name);
  }

  static async getAll(): Promise<Fabric[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'FABRIC#',
      },
      ScanIndexForward: false,
    });

    const result = await docClient.send(command);
    return result.Items as Fabric[] || [];
  }

  static async update(name: string, updateData: Partial<CreateFabricData>): Promise<Fabric> {
    const existing = await this.getById(name);
    if (!existing) {
      throw new Error('Fabric not found');
    }

    // If updating name, check uniqueness
    if (updateData.name && updateData.name !== name) {
      const nameExists = await this.getByName(updateData.name);
      if (nameExists) {
        throw new Error('Fabric with this name already exists');
      }
    }

    const updatedFabric: Fabric = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // If name changed, update PK and SK
    if (updateData.name && updateData.name !== name) {
      updatedFabric.PK = `FABRIC#${updateData.name}`;
      updatedFabric.SK = `FABRIC#${updateData.name}`;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: `FABRIC#${name}`,
        SK: `FABRIC#${name}`,
      },
      UpdateExpression: 'SET #name = :name, #length = :length, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#length': 'length',
      },
      ExpressionAttributeValues: {
        ':name': updatedFabric.name,
        ':length': updatedFabric.length,
        ':updatedAt': updatedFabric.updatedAt,
      },
    });

    await docClient.send(command);
    return updatedFabric;
  }

  static async delete(name: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `FABRIC#${name}`,
        SK: `FABRIC#${name}`,
      },
    });

    await docClient.send(command);
  }
}

export default FabricModel;