"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sun, Camera, Briefcase, Search, ArrowRight } from 'lucide-react';

const TravelPage = () => {
  // A beautiful, free-to-use Unsplash elephant image that matches the target vibe
  const backgroundImage = "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&q=80&w=2600";

  return (
    <div className="min-h-screen bg-background p-3 md:p-5 font-sans flex flex-col">
      
      {/* 2. THE INNER SCREEN */}
      <div 
        className="relative flex-1 rounded-[3rem] overflow-hidden bg-bark shadow-2xl bg-cover bg-center transition-all duration-700 hover:shadow-bark/20"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        {/* Subtle warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>

        {/* 3. HEADER NAVIGATION */}
        <header className="absolute top-0 left-0 right-0 z-50 pt-8 flex justify-center">
          <nav className="flex items-center">
            
            {/* Left Pill Group */}
            <div className="flex glass-panel rounded-full py-2 pl-4 pr-10 -mr-8 z-10">
              {['Reservations', 'Packages', 'Gallery', 'Safety'].map((item) => (
                <button key={item} className="px-5 py-2 text-sm font-bold text-foreground hover:bg-bark/10 rounded-full transition-all">
                  {item}
                </button>
              ))}
            </div>

            {/* Center Logo */}
            <div className="bg-ivory text-bark px-10 py-4 rounded-[2rem] z-20 shadow-2xl border border-white/50">
              <span className="text-xl font-black tracking-tighter uppercase">ForestReserve</span>
            </div>

            {/* Right Pill Group */}
            <div className="flex glass-panel rounded-full py-2 pr-4 pl-10 -ml-8 z-10">
              {['Elephant', 'Tiger', 'Birding', 'Trails'].map((item) => (
                <button key={item} className="px-5 py-2 text-sm font-bold text-foreground hover:bg-bark/10 rounded-full transition-all">
                  {item}
                </button>
              ))}
            </div>

          </nav>
        </header>

        {/* 4. MAIN HERO TITLE */}
        <div className="absolute top-[25%] left-0 right-0 text-center z-20">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-[8rem] font-black text-white tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            Discover the Wild
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-lg font-black tracking-[0.4em] uppercase mt-4 drop-shadow-md"
          >
            Authentic Safari Experiences
          </motion.p>
        </div>

        {/* 5. FLOATING GLASS BLOCKS */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-[45%] left-[8%] w-[340px] rounded-[2.5rem] p-8 z-20 glass-panel shadow-2xl"
        >
          <p className="text-base text-foreground leading-relaxed font-bold">
            Set off on a thrilling safari journey through expansive terrains filled
            with diverse wildlife and ancient flora.
          </p>
          <button className="mt-6 flex items-center gap-2 text-sm font-black text-bark border-b-2 border-bark/20 pb-1 hover:border-bark transition-all group">
            Explore Routes <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-[20%] right-[8%] w-[340px] rounded-[2.5rem] p-8 z-20 dark-glass shadow-2xl"
        >
          <p className="text-base text-white leading-relaxed font-bold">
            Embark on an unforgettable safari adventure, exploring vast landscapes
            teeming with majestic wildlife and birds.
          </p>
        </motion.div>

        {/* 6. BOTTOM BAR */}
        <footer className="absolute bottom-10 left-[8%] right-[8%] z-50 flex justify-between items-end">
          <div className="flex items-center gap-x-10 rounded-full px-10 py-5 dark-glass shadow-2xl">
            <div className="flex-col flex">
                <span className="text-[10px] font-black text-primary-foreground/60 uppercase tracking-[0.2em]">Live Alerts</span>
                <span className="text-sm font-bold text-white">20+ SCENIC SPOTS ACTIVE</span>
            </div>

            <div className="flex items-center gap-x-6 text-white">
              <CheckCircle2 className="h-5 w-5 cursor-pointer hover:scale-110 transition-all" />
              <Sun className="h-5 w-5 cursor-pointer hover:scale-110 transition-all" />
              <Camera className="h-5 w-5 cursor-pointer hover:scale-110 transition-all" />
              <Briefcase className="h-5 w-5 cursor-pointer hover:scale-110 transition-all" />
              
              <div className="ml-4 pl-8 border-l border-white/20">
                <Search className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <Search className="h-5 w-5" />
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default TravelPage;