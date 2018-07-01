// Cache Name, bump for sw update
let staticCacheName = 'curr-conv-8';


// Installation, caches links
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                self.registration.scope + '',
                self.registration.scope + 'es6/app.js',
                self.registration.scope + 'css/one-page-wonder.css',
                self.registration.scope + 'vendor/bootstrap/css/bootstrap.min.css',
                self.registration.scope + 'vendor/bootstrap/js/bootstrap.bundle.min.js',
                self.registration.scope + 'vendor/jquery/jquery.min.js',
                self.registration.scope + 'vendor/idb/idb.js',
                'https://fonts.googleapis.com/css?family=Catamaran:100,200,300,400,500,600,700,800,900',
                'https://fonts.googleapis.com/css?family=Lato:100,100i,300,300i,400,400i,700,700i,900,900i',
                'https://free.currencyconverterapi.com/api/v5/currencies'
            ]);
        })
    );
});

// Activation removes old cachess
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('curr-conv') &&
                        cacheName !== staticCacheName;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

//Intercept all the fetches and serve cache for cached ressources.
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            
            return response || fetch(event.request);
        })
    );
});