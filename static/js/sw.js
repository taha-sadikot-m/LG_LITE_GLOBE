const CACHE_NAME = 'map-cache-v2';
const CACHE_URLS = [
    '/static/css/style.css',
    'https://cdn.maptiler.com/maptiler-sdk-js/v1.2.0/maptiler-sdk.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js',
    /^https:\/\/api\.maptiler\.com\/maps\/.*/,
    /^https:\/\/api\.maptiler\.com\/tiles\/.*/
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CACHE_URLS.filter(url => typeof url === 'string'))))
});

self.addEventListener('fetch', (event) => {
    if (CACHE_URLS.some(url => {
        if (typeof url === 'string') return event.request.url.includes(url);
        return url.test(event.request.url);
    })) {
        event.respondWith(
            caches.match(event.request)
                .then(cached => cached || fetch(event.request))
        );
    }
});