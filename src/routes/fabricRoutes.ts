import express from 'express';
import * as fabricController from '../controllers/fabricController';

const router = express.Router();

router.post('/', fabricController.addFabric);

router.post('/issue', fabricController.issueFabric);

router.put('/:name', fabricController.updateFabric);

router.delete('/:name', fabricController.deleteFabric);

router.get('/:name', fabricController.getFabric);

router.get('/', fabricController.getAllFabrics);

export default router;
