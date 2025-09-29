// public/sw.js
self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.message || '',
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});



self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/')); 
});
