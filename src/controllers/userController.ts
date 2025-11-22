import { Request, Response } from 'express';
import UserModel from '../models/userModel';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    interface CreateUserRequest {
  firstname: string;
  age: number;
}

const { firstname, age } = req.body as CreateUserRequest;


    if (!firstname || age === undefined) {
      res.status(400).json({ error: 'Firstname and age are required' });
      return;
    }
    const user = await UserModel.create({ firstname, age });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    // const users = await UserModel.getAll();
    const testv = process.env.NODE_ENV;
    res.status(200).json(testv);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await UserModel.getById(id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstname, age } = req.body;

    const updateData: { firstname?: string; age?: number } = {};
    if (firstname !== undefined) updateData.firstname = firstname;
    if (age !== undefined) updateData.age = age;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'At least one field must be provided for update' });
      return;
    }

    if (age !== undefined && (typeof age !== 'number' || age < 0)) {
      res.status(400).json({ error: 'Age must be a positive number' });
      return;
    }

    const updatedUser = await UserModel.update(id, updateData);
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await UserModel.delete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
