let staticCacheName = 'curr-conv-7';

self.addEventListener('install', function (event) {
    console.log("service worker installing")
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                '/',
                'es6/app.js',
                'css/one-page-wonder.css',
                'vendor/bootstrap/css/bootstrap.min.css',
                'vendor/bootstrap/js/bootstrap.bundle.min.js',
                'vendor/jquery/jquery.min.js',
                'vendor/idb/idb.js',
                'https://fonts.googleapis.com/css?family=Catamaran:100,200,300,400,500,600,700,800,900',
                'https://fonts.googleapis.com/css?family=Lato:100,100i,300,300i,400,400i,700,700i,900,900i',
                'https://free.currencyconverterapi.com/api/v5/currencies'
            ]);
        })
    );
});

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

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            
            return response || fetch(event.request);
        })
    );
});