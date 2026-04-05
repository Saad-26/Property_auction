import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import Property from '../models/Property.js';

export const getActiveAuctions = async (req: Request, res: Response) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: { status: 'ACTIVE' },
      include: { owner: { select: { email: true } } },
    });

    const propertyIds = auctions.map((a) => a.propertyId);
    const properties = await Property.find({ propertyId: { $in: propertyIds } });

    const mergedAuctions = auctions.map((auction) => ({
      ...auction,
      property: properties.find((p) => p.propertyId === auction.propertyId),
    }));

    res.json(mergedAuctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAuctionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: { 
        owner: { select: { email: true } },
        bids: { orderBy: { amount: 'desc' }, take: 5, include: { user: { select: { email: true } } } }
      },
    });

    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const property = await Property.findOne({ propertyId: auction.propertyId });

    res.json({ ...auction, property });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
