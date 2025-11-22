import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand, 
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION_NAME,
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME as string;

export interface User {
  PK: string;
  SK: string;
  firstname: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstname: string;
  age: number;
}

export interface UpdateUserData {
  firstname?: string;
  age?: number;
}

class UserModel {
  /**
   * Create a new user
   * @param {CreateUserData} data - User data with firstname and age
   * @returns {Promise<User>} Created user item
   */
  static async create(data: CreateUserData): Promise<User> {
    const id = uuidv4();

    const item: User = {
      PK: id,
      SK: id,
      firstname: data.firstname,
      age: data.age,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: item
    };

    try {
      await docClient.send(new PutCommand(params));
      return item;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<User>} User item
   */
  static async getById(id: string): Promise<User> {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: id,
        SK: id
      }
    };

    try {
      const result = await docClient.send(new GetCommand(params));
      if (!result.Item) {
        throw new Error('User not found');
      }
      return result.Item as User;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users
   * @returns {Promise<User[]>} Array of users
   */
  static async getAll(): Promise<User[]> {
    const params = {
      TableName: TABLE_NAME
    };

    try {
      const result = await docClient.send(new ScanCommand(params));
      return (result.Items || []) as User[];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {UpdateUserData} data - Fields to update
   * @returns {Promise<User>} Updated user item
   */
  static async update(id: string, data: UpdateUserData): Promise<User> {
    const updateExpression: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    Object.keys(data).forEach((key, index) => {
      if (key !== 'id' && key !== 'createdAt') {
        updateExpression.push(`#${key} = :val${index}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:val${index}`] = data[key as keyof UpdateUserData];
      }
    });

    if (updateExpression.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Always update the updatedAt timestamp
    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: id,
        SK: id
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW' as const
    };

    try {
      const result = await docClient.send(new UpdateCommand(params));
      return result.Attributes as User;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<{message: string}>} Success message
   */
  static async delete(id: string): Promise<{ message: string }> {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: id,
        SK: id
      }
    };

    try {
      await docClient.send(new DeleteCommand(params));
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

export default UserModel;
