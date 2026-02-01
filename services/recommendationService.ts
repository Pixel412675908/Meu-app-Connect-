
import { LinkItem } from '../types';

/**
 * TRENDING_ITEMS: Itens "Virais" selecionados para cada categoria.
 * Estes itens representam a tendência global do portal.
 */
export const TRENDING_ITEMS: Record<string, { name: string, url: string, message: string, icon: string, category: string }> = {
  ia: {
    name: 'DeepSeek Chat',
    url: 'https://chat.deepseek.com',
    message: 'A IA mais eficiente do momento para código e lógica.',
    icon: 'fa-brain',
    category: 'Inteligência Artificial'
  },
  jogo: {
    name: 'Poki Games',
    url: 'https://poki.com',
    message: 'Baseado no seu gosto: O maior playground de jogos web.',
    icon: 'fa-gamepad',
    category: 'Jogos'
  },
  streaming: {
    name: 'Pluto TV',
    url: 'https://pluto.tv',
    message: 'Curte Streaming? Veja centenas de canais grátis agora.',
    icon: 'fa-tv',
    category: 'Streaming'
  },
  outro: {
    name: 'AlphaCoders 8K',
    url: 'https://alphacoders.com/popular-8k-wallpapers',
    message: 'Para o seu setup: Wallpapers em altíssima resolução.',
    icon: 'fa-image',
    category: 'Utilidades'
  },
  // Fallback para novos usuários
  general: {
    name: 'Google Gemini',
    url: 'https://gemini.google.com',
    message: 'Destaque da semana: A IA multimodal do Google.',
    icon: 'fa-sparkles',
    category: 'Tendência Geral'
  }
};

class RecommendationService {
  private STORAGE_KEY = 'portal_user_affinity';

  /**
   * Registra o interesse do usuário em uma categoria específica.
   */
  trackClick(category: string) {
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    const affinityMap: Record<string, number> = rawData ? JSON.parse(rawData) : { ia: 0, jogo: 0, streaming: 0, outro: 0 };
    
    // Normaliza a categoria para as chaves do mapa
    const key = category.toLowerCase();
    if (affinityMap[key] !== undefined) {
      affinityMap[key]++;
    } else {
      affinityMap['outro']++;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(affinityMap));
  }

  /**
   * Calcula qual item recomendar baseado no histórico de afinidade.
   */
  getRecommendation() {
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return TRENDING_ITEMS.general;

    const affinityMap: Record<string, number> = JSON.parse(rawData);
    
    // Encontra a categoria com mais cliques
    let favoriteCategory = 'general';
    let maxClicks = 0;

    Object.entries(affinityMap).forEach(([cat, clicks]) => {
      if (clicks > maxClicks) {
        maxClicks = clicks;
        favoriteCategory = cat;
      }
    });

    // Se o usuário ainda não clicou em nada o suficiente, retorna o geral
    if (maxClicks === 0) return TRENDING_ITEMS.general;

    return TRENDING_ITEMS[favoriteCategory] || TRENDING_ITEMS.general;
  }
}

export const recommendationService = new RecommendationService();
