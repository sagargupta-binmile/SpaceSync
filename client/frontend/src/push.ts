// src/push.ts
export async function subscribeUser() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      ),
    });

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    
  }
}


function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
