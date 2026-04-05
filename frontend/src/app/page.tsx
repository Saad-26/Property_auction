'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Gavel, Clock, MapPin, Building2, User } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Auction } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/auctions';

export default function Dashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const response = await fetch(`${API_URL}/active`);
        const data = await response.json();
        setAuctions(data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAuctions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 md:p-12 lg:p-16">
      <Toaster position="bottom-right" />
      
      <header className="max-w-7xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-4">
              Premium Property Auctions
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl font-light">
              Experience the pinnacle of real estate transactions with our high-concurrency bidding platform. 
              Secure, transparent, and built for speed.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <Building2 className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Total Active</p>
              <p className="text-2xl font-black text-white">{auctions.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction, idx) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_80px_-20px_rgba(37,99,235,0.15)]"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={auction.property?.images[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800'} 
                  alt={auction.property?.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md bg-opacity-80">
                  {auction.status}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                    {auction.property?.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-slate-500 mb-6 font-medium">
                  <MapPin size={16} />
                  <span className="text-sm">{auction.property?.location.city}, {auction.property?.location.state}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Current Bid</p>
                    <p className="text-xl font-black text-blue-400">${auction.currentHighestBid.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Ending In</p>
                    <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <Clock size={14} />
                      <span className="text-sm">2d 14h</span>
                    </div>
                  </div>
                </div>

                <Link href={`/auction/${auction.id}`}>
                  <button className="w-full bg-slate-50 text-slate-950 py-4 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                    Place a Bid
                    <Gavel size={18} className="group-hover/btn:rotate-12 transition-transform" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
