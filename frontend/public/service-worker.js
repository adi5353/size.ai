/**
 * Service Worker for size.ai PWA
 * Implements caching strategies for offline functionality
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `sizeai-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/calculator',
  '/dashboard',
  '/ai-assistant',
  '/cost-comparison',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
];

// API endpoints that should use network-first strategy
const API_ENDPOINTS = [
  '/api/auth',
  '/api/configurations',
  '/api/ai/chat',
  '/api/admin',
  '/api/reports',
];

/**
 * Install event - precache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy based on request type
  if (isApiRequest(url)) {
    // Network-first for API requests
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Stale-while-revalidate for HTML pages
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

/**
 * Check if request is an API call
 */
function isApiRequest(url) {
  return API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

/**
 * Check if request is a static asset
 */
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/);
}

/**
 * Network-first strategy: Try network, fall back to cache
 * Good for API requests that need fresh data
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy: Try cache, fall back to network
 * Good for static assets that rarely change
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache the new asset
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed for:', request.url, error);
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy: Return cache, update in background
 * Good for HTML pages - fast response with eventual consistency
 */
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[Service Worker] Background fetch failed:', request.url);
  });
  
  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-configurations') {
    event.waitUntil(syncConfigurations());
  }
});

/**
 * Sync configurations when back online
 */
async function syncConfigurations() {
  // Implementation would sync any offline changes
  console.log('[Service Worker] Syncing configurations...');
  // This is a placeholder - actual implementation would depend on your backend
}

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'size-ai-notification',
    requireInteraction: false,
  };
  
  event.waitUntil(
    self.registration.showNotification('size.ai', options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[Service Worker] Loaded successfully');
