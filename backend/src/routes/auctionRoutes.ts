import express from 'express';
import { getActiveAuctions, getAuctionById } from '../controllers/auctionController.js';

const router = express.Router();

router.get('/active', getActiveAuctions);
router.get('/:id', getAuctionById);

export default router;
