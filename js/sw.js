var webCache = 'mws-static-001';
self.adddEventListener("install", event => {
    event.waitUntil(
        caches.open(webCache).then(cache => {
            return cache.addAll([
                "/",
                "/index.html",
                "/restaurant.html",
                "/js/",
                "/js/main.js",
                "/js/dbhelper.js",
                "/js/restaurant_info.js",
                "/js/register.js",
                "/img/error.png",
                "/css/styles.css",
                "/data/restaurants.json"
            ]).catch(error => {
                console.log("Caches open failed: " + error);
            });
        })
    );
});

  
self.addEventListener('fetch', event => {
  let cacheRequest = event.request;
  let cacheObj = new URL(event.request.url);  
  if(event.request.url.indexOf("/restaurant.html") > -1){
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }
  if (cacheObj.hostname !== "localhost") {
    event.request.mode = "no-cors";
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || 
      fetch(event.request)
        .then (eventresponse  => {
          return caches.open(staticCacheName).then(cache => {
            cache.put(event.request, eventresponse.clone());
            return eventresponse;
          });
        }).catch(error => {
          if(event.request.url.indexOf(".jpg") > -1){
            return caches.match("/img/error.png");
          }
          return new Response("Application is not connected to the internet" , {
            status: 404,
            statusText: "Application is not connected to the internet"
          });
        })
      
    })  
  );
});
  
 
