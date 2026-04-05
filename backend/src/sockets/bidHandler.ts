import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma.js';

export function setupBidHandlers(io: Server, socket: Socket) {
  // Join the room for a specific auction
  socket.on('join-auction', (auctionId: string) => {
    socket.join(`auction:${auctionId}`);
    console.log(`User ${socket.id} joined room: auction:${auctionId}`);
  });

  // Handle placing a new bid
  socket.on('place-bid', async (data: { auctionId: string; userId: string; amount: number }) => {
    const { auctionId, userId, amount } = data;

    try {
      // 3. BIDDING LOGIC (CRITICAL): Execute atomic Prisma Transaction
      const result = await prisma.$transaction(async (tx) => {
        // a. Fetch the auction and ensure it exists and is ACTIVE
        const auction = await tx.auction.findUnique({
          where: { id: auctionId },
          select: { status: true, currentHighestBid: true, startPrice: true },
        });

        if (!auction) throw new Error('Auction not found');
        if (auction.status !== 'ACTIVE') throw new Error('Auction is not ACTIVE');

        // b. Verify the bid amount > currentHighestBid
        if (amount <= (auction.currentHighestBid || auction.startPrice)) {
          throw new Error('Bid amount must be higher than current highest bid');
        }

        // c. Verify user exists and potentially has enough balance (if required)
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        // d. Create the Bid record and update the Auction.currentHighestBid
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            userId,
            amount,
          },
          include: { user: { select: { email: true } } },
        });

        await tx.auction.update({
          where: { id: auctionId },
          data: { currentHighestBid: amount },
        });

        return newBid;
      });

      // e. Broadcast 'update-bid' to the auction room only (highly concurrent)
      io.to(`auction:${auctionId}`).emit('update-bid', {
        auctionId,
        newBid: result,
      });

      console.log(`Bid success: ${amount} on auction ${auctionId} by ${userId}`);
    } catch (error: any) {
      // f. Emit 'bid-error' back to the sender
      console.error('Bidding failed:', error.message);
      socket.emit('bid-error', { error: error.message });
    }
  });
}
