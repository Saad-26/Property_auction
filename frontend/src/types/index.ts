export type AuctionStatus = 'PENDING' | 'ACTIVE' | 'ENDED';

export interface Property {
  _id: string;
  propertyId: string;
  title: string;
  description: string;
  images: string[];
  amenities: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface User {
  id: string;
  email: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: string;
  user: {
    email: string;
  };
}

export interface Auction {
  id: string;
  propertyId: string;
  startPrice: number;
  currentHighestBid: number;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  property: Property;
  owner: {
    email: string;
  };
  bids?: Bid[];
}
