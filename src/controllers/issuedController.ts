import { Request, Response } from 'express';
import IssuedFabricModel from '../models/issuedFabricModel';

export async function getAllIssuedFabrics(_req: Request, res: Response): Promise<void> {
  try {
    const issuedFabrics = await IssuedFabricModel.getAll();
    res.status(200).json(issuedFabrics);
  } catch (error) {
    console.error('Error getting all issued fabrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function assignType(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.params;
    const { type } = req.body;

    if (!type) {
      res.status(400).json({ error: 'Type is required' });
      return;
    }

    const allowedTypes = ['cutting', 'sewing'];
    if (!allowedTypes.includes(type.toLowerCase())) {
      res.status(400).json({ error: `Type must be one of: ${allowedTypes.join(', ')}` });
      return;
    }

    const issuedFabric = await IssuedFabricModel.assignType(name, type.toLowerCase());
    res.status(200).json(issuedFabric);
  } catch (error) {
    if (error instanceof Error && error.message === 'Issued fabric not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error assigning type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
