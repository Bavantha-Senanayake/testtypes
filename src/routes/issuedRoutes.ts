import express from 'express';
import * as issuedController from '../controllers/issuedController';

const router = express.Router();

router.get('/', issuedController.getAllIssuedFabrics);

router.put('/:name/type', issuedController.assignType);

export default router;
