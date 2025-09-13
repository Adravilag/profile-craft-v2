import express from 'express';
import { debugController } from '../controllers/debugController.js';

const router = express.Router();

router.get('/inspect-token', debugController.inspectToken);
router.post('/clear-security', debugController.clearSecurity);

export default router;
