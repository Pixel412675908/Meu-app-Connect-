// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ExternalLink, Sparkles, Brain, Gamepad2, Tv, LayoutGrid } from 'lucide-react';
import { useSmartRecommendations } from '../hooks/useSmartRecommendations';

interface SmartNotificationProps {
  isDark: boolean;
  accentColor: string;
}

const CategoryIcon = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'fa-brain': return <Brain className="w-4 h-4" />;
    case 'fa-gamepad': return <Gamepad2 className="w-4 h-4" />;
    case 'fa-tv': return <Tv className="w-4 h-4" />;
    case 'fa-image': return <LayoutGrid className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
};

const SmartNotification: React.FC<SmartNotificationProps> = ({ isDark, accentColor }) => {
  const suggestion = useSmartRecommendations();
  const [isVisible, setIsVisible] = React.useState(false);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const scale = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);

  React.useEffect(() => {
    if (suggestion) {
      setIsVisible(true);
      // Auto-fechar após 7 segundos
      const timer = setTimeout(() => setIsVisible(false), 7000);
      return () => clearTimeout(timer);
    }
  }, [suggestion]);

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > 100) {
      setIsVisible(false);
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-[360px] pointer-events-none">
      <AnimatePresence>
        {isVisible && suggestion && (
          <motion.div
            style={{ x, opacity, scale }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto flex items-center gap-3 p-3 rounded-[1.8rem] border shadow-2xl cursor-grab active:cursor-grabbing
              ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/90 border-gray-100'}
              backdrop-blur-xl
            `}
          >
            {/* Ícone Estilo Dynamic Island */}
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              <CategoryIcon iconName={suggestion.icon} />
            </div>

            {/* Conteúdo Compacto */}
            <div className="flex-1 min-w-0" onClick={() => window.open(suggestion.url, '_blank')}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-30">
                  Recomendação
                </span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
              </div>
              <h4 className={`text-[12px] font-bold truncate leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {suggestion.name}
              </h4>
              <p className={`text-[9px] font-medium opacity-50 truncate leading-tight`}>
                {suggestion.message}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1 shrink-0">
               <button 
                onClick={() => window.open(suggestion.url, '_blank')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartNotification;