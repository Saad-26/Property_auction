'use client';

import { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Clock, MapPin, Building2, Hammer, Trophy, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import { Auction, Bid } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/auctions';

export default function AuctionRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const { socket, isConnected } = useSocket();

  // Mock User ID - In a real app, this would come from Auth
  const userId = "temp-user-id"; 

  useEffect(() => {
    async function fetchAuctionDetails() {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();
        setAuction(data);
        setBidAmount((data.currentHighestBid + 50000).toString());
      } catch (error) {
        console.error('Error fetching auction details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAuctionDetails();
  }, [id]);

  useEffect(() => {
    if (socket && isConnected && id) {
      socket.emit('join-auction', id);

      socket.on('update-bid', (data: { auctionId: string; newBid: Bid }) => {
        if (data.auctionId === id) {
          setAuction((prev) => prev ? ({
            ...prev,
            currentHighestBid: data.newBid.amount,
            bids: [data.newBid, ...(prev.bids || [])].slice(0, 5)
          }) : null);
          
          toast.success(`New record bid: $${data.newBid.amount.toLocaleString()}`, {
            icon: '🔥',
            style: {
                borderRadius: '1rem',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #1e293b'
            }
          });
        }
      });

      socket.on('bid-error', (data: { error: string }) => {
        setIsPlacingBid(false);
        toast.error(data.error, {
            style: {
                borderRadius: '1rem',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #1e293b'
            }
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('update-bid');
        socket.off('bid-error');
      }
    };
  }, [socket, isConnected, id]);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !isConnected) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= (auction?.currentHighestBid || 0)) {
       toast.error("Bid must be more than current highest.");
       return;
    }

    setIsPlacingBid(true);
    socket.emit('place-bid', {
      auctionId: id,
      userId,
      amount
    });
    
    // Reset loading state after a timeout in case of no response
    setTimeout(() => setIsPlacingBid(false), 2000);
  };

  if (loading || !auction) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Toaster position="top-center" />
      
      {/* Navigation Header */}
      <nav className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{auction.property?.title}</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Live Auction Room</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
             <span className="text-xs font-bold text-slate-400">{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Property Info */}
        <div className="lg:col-span-8 space-y-12">
          {/* Main Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[32rem] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-slate-800"
          >
            <img src={auction.property?.images[0]} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <Building2 className="text-blue-500" />
                Property Specifications
              </h2>
              <p className="text-slate-400 leading-relaxed font-light text-lg mb-8">
                {auction.property?.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {auction.property?.amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                    <TrendingUp className="text-indigo-500" />
                    Live Bid History
                </h2>
                <div className="space-y-3">
                    {auction.bids?.length ? auction.bids.map((bid, i) => (
                        <div key={bid.id || i} className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                                    {bid.user.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold truncate w-32">{bid.user.email}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Successful Bid</p>
                                </div>
                            </div>
                            <p className="text-lg font-black text-white">${bid.amount.toLocaleString()}</p>
                        </div>
                    )) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-3xl opacity-40">
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Waiting for first bid...</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Right: Bidding Controls */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-6">
            {/* Countdown / Status Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2 opacity-80 uppercase tracking-widest font-black text-[10px]">
                    <Clock size={14} />
                    Current Status: {auction.status}
                 </div>
                 <h2 className="text-sm uppercase tracking-widest font-bold opacity-80 mb-2">Current Highest Bid</h2>
                 <p className="text-5xl font-black mb-6 tracking-tighter">${auction.currentHighestBid.toLocaleString()}</p>
                 <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <Trophy size={20} className="text-yellow-400" />
                    <div>
                        <p className="text-[10px] uppercase font-bold opacity-70">Top Bidder</p>
                        <p className="text-sm font-bold">Anonymous_773</p>
                    </div>
                 </div>
               </div>
               {/* Decorative Circle */}
               <div className="absolute -bottom-12 -right-12 h-48 w-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Bidding Form */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <Hammer className="text-blue-500" />
                  Place a New Bid
               </h3>
               
               <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600">$</span>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-6 pl-12 rounded-3xl text-2xl font-black focus:border-blue-500 focus:outline-none transition-all" 
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                      type="button"
                      onClick={() => setBidAmount((auction.currentHighestBid + 100000).toString())}
                      className="bg-slate-800/50 border border-slate-700/50 py-3 rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-colors"
                    >
                      +$100k
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBidAmount((auction.currentHighestBid + 250000).toString())}
                      className="bg-slate-800/50 border border-slate-700/50 py-3 rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-colors"
                    >
                      +$250k
                    </button>
                  </div>

                  <button 
                    disabled={!isConnected || isPlacingBid}
                    className="w-full bg-blue-600 p-6 rounded-[2rem] font-black text-xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {isPlacingBid ? 'PROCESSING...' : 'CONFIRM BID'}
                  </button>
               </form>
               
               <div className="mt-8 flex items-start gap-4 p-4 border border-blue-500/10 bg-blue-500/5 rounded-2xl">
                 <AlertCircle size={20} className="text-blue-500 shrink-0" />
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">
                   By placing a bid, you agree to our Terms of Sale. This action is legally binding for the purchase of the property.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
