import React, { useState, useEffect } from 'react';
import { TRENDING_ITEMS } from '../services/recommendationService';

export const useSmartRecommendations = () => {
  const [suggestion, setSuggestion] = React.useState<any>(null);

  React.useEffect(() => {
    const calculateSuggestion = () => {
      const now = new Date();
      const hour = now.getHours();
      const today = now.toDateString();
      
      const isDayTime = hour >= 6 && hour < 18;
      const storageKey = isDayTime ? 'portal_last_global_show' : 'portal_last_personal_show';
      
      // Regra de 1 por dia (por tipo)
      const lastShow = localStorage.getItem(storageKey);
      if (lastShow === today) return null;

      // Pegar afinidade do usuário
      const rawAffinity = localStorage.getItem('portal_user_affinity');
      const affinity = rawAffinity ? JSON.parse(rawAffinity) : { ia: 0, jogo: 0, streaming: 0, outro: 0 };
      
      let topCategory = 'ia';
      let maxClicks = 0;
      Object.entries(affinity).forEach(([cat, clicks]) => {
        if ((clicks as number) > maxClicks) {
          maxClicks = clicks as number;
          topCategory = cat;
        }
      });

      let selectedItem;

      if (isDayTime) {
        // DIA: Sugestão Global (Trending)
        selectedItem = TRENDING_ITEMS.general;
      } else {
        // NOITE: Sugestão Pessoal + Diversificação
        const rand = Math.random();
        
        if (rand < 0.7 && maxClicks > 0) {
          // 70% chance de sugerir uma categoria DIFERENTE da favorita (anti-bolha)
          const otherCategories = Object.keys(TRENDING_ITEMS).filter(c => c !== topCategory && c !== 'general');
          const randomCat = otherCategories[Math.floor(Math.random() * otherCategories.length)];
          selectedItem = { 
            ...TRENDING_ITEMS[randomCat], 
            message: `Que tal mudar um pouco? Explore ${TRENDING_ITEMS[randomCat].category}.` 
          };
        } else {
          // 30% chance de sugerir o melhor da categoria favorita
          selectedItem = TRENDING_ITEMS[topCategory] || TRENDING_ITEMS.general;
        }
      }

      if (selectedItem) {
        setSuggestion(selectedItem);
        localStorage.setItem(storageKey, today);
      }
    };

    // Pequeno delay para não sobrecarregar o mount inicial
    const timeout = setTimeout(calculateSuggestion, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return suggestion;
};