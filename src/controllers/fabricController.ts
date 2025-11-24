import { Request, Response } from 'express';
import FabricModel from '../models/fabricModel';
import TransactionModel from '../models/transactionModel';
import IssuedFabricModel from '../models/issuedFabricModel';

export const addFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    interface CreateFabricRequest {
      name: string;
      length: number;
    }

    const { name, length } = req.body as CreateFabricRequest;

    if (!name || length === undefined) {
      res.status(400).json({ error: 'Name and length are required' });
      return;
    }

    if (typeof length !== 'number' || length <= 0) {
      res.status(400).json({ error: 'Length must be a positive number' });
      return;
    }

    const fabric = await FabricModel.create({ name, length });
    res.status(201).json(fabric);
  } catch (error) {
    if (error instanceof Error && error.message === 'Fabric with this name already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    console.error('Error creating fabric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    const { name: newName, length } = req.body;

    const updateData: { name?: string; length?: number } = {};
    if (newName !== undefined) updateData.name = newName;
    if (length !== undefined) updateData.length = length;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'At least one field must be provided for update' });
      return;
    }

    if (length !== undefined && (typeof length !== 'number' || length <= 0)) {
      res.status(400).json({ error: 'Length must be a positive number' });
      return;
    }

    const updatedFabric = await FabricModel.update(name, updateData);
    res.status(200).json(updatedFabric);
  } catch (error) {
    if (error instanceof Error && error.message === 'Fabric not found') {
      res.status(404).json({ error: 'Fabric not found' });
      return;
    }
    if (error instanceof Error && error.message === 'Fabric with this name already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    console.error('Error updating fabric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    await FabricModel.delete(name);
    res.status(200).json({ message: 'Fabric deleted successfully' });
  } catch (error) {
    console.error('Error deleting fabric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    const fabric = await FabricModel.getById(name);
    
    if (!fabric) {
      res.status(404).json({ error: 'Fabric not found' });
      return;
    }
    
    res.status(200).json(fabric);
  } catch (error) {
    console.error('Error getting fabric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllFabrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const fabrics = await FabricModel.getAll();
    res.status(200).json(fabrics);
  } catch (error) {
    console.error('Error getting all fabrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const issueFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    interface IssueFabricRequest {
      name: string;
      length: number;
    }

    const { name, length } = req.body as IssueFabricRequest;

    if (!name || length === undefined) {
      res.status(400).json({ error: 'Name and length are required' });
      return;
    }

    if (typeof length !== 'number' || length <= 0) {
      res.status(400).json({ error: 'Length must be a positive number' });
      return;
    }

    const fabric = await FabricModel.getById(name);
    if (!fabric) {
      res.status(404).json({ error: 'Fabric not found' });
      return;
    }

    if (fabric.length < length) {
      res.status(400).json({ error: `Insufficient fabric length. Available: ${fabric.length}, Requested: ${length}` });
      return;
    }

    const newLength = fabric.length - length;
    await FabricModel.update(name, { length: newLength });

    await TransactionModel.create({
      fabricName: name,
      issuedLength: length,
    });

    const issuedFabric = await IssuedFabricModel.addIssuedLength(name, length);

    res.status(200).json({
      message: 'Fabric issued successfully',
      remainingLength: newLength,
      totalIssued: issuedFabric.totalIssuedLength,
    });
  } catch (error) {
    console.error('Error issuing fabric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
