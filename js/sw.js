var webCache = 'mws-static-001';
var urlsToCache = ["/",
"/index.html",
"/restaurant.html",
"/js/",                
"/img/error.png",
"/css/styles.css",
"/data/restaurants.json"];
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(webCache).then(function(cache) {
            return cache.addAll(urlsToCache);
          })
        );
    });    
      
  

  
self.addEventListener('fetch', function(event) {
  let cacheRequest = event.request;
  let cacheObj = new URL(event.request.url);  
  /*if(event.request.url.indexOf("/restaurant.html") > -1){
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }
  if (cacheObj.hostname !== "localhost") {
    event.request.mode = "no-cors";
  }*/
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || 
      fetch(event.request)
        .then (function (eventresponse) {
          return caches.open(webCache).then(function(cache) {
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
  
 
