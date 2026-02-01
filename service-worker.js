
const CACHE_NAME = 'portal-web-cache-v4';
const OFFLINE_URL = './index.html';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://i.postimg.cc/gJzFByk5/file-0000000098b8720e9deb64f615033168.png',
  // Cache das dependências críticas do ESM.sh para evitar tela branca offline
  'https://esm.sh/react@19.2.3',
  'https://esm.sh/react-dom@19.2.3',
  'https://esm.sh/react-dom@19.2.3/client',
  'https://esm.sh/framer-motion@11.11.11?deps=react@19.2.3,react-dom@19.2.3',
  'https://esm.sh/lucide-react@0.454.0?deps=react@19.2.3',
  'https://esm.sh/@google/genai@1.37.0'
];

// Instalação: Força o cache de todos os recursos essenciais imediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Cacheando App Shell e dependências...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Força a ativação imediata
});

// Ativação: Limpa caches obsoletos e assume controle dos clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume controle das abas abertas imediatamente
  );
});

// Intercepção de Requisições: Cache-First Strategy
self.addEventListener('fetch', (event) => {
  // Apenas lida com requisições GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se estiver no cache, retorna imediatamente (App instantâneo)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não estiver no cache, tenta a rede e armazena o resultado
      return fetch(event.request).then((networkResponse) => {
        // Verifica se a resposta é válida antes de cachear
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // FALLBACK CRÍTICO: Se a rede falhar e for uma navegação (HTML), retorna o index.html
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return null;
      });
    })
  );
});
