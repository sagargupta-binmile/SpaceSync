// public/sw.js
self.addEventListener('push', function (event) {
  const data = event.data.json();
 console.log('Push received:', data.title, data.message);

  const title = data.message; // entire booking info as title
const options = {
  body: '', // optional
  icon: '/favicon.ico',
};

  event.waitUntil(self.registration.showNotification(title, options));
});



self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/')); 
});
