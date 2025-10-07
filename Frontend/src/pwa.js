// src/pwa.js
let deferredPrompt = null;

export function setupPWA() {
  // Đăng ký service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    });
  }

  // Bắt sự kiện cài đặt (Android/Chrome)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new Event("pwa-install-available"));
  });
}

export async function installPWA() {
  if (!deferredPrompt) return { outcome: "unavailable" };
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return result; // { outcome: 'accepted' | 'dismissed' }
}
