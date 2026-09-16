let deferredInstallPrompt;
const installButton = document.querySelector('#install-button');

function isNudgeInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Install-button logic: Chrome supplies this prompt only when Nudge is installable.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;

  if (!isNudgeInstalled()) {
    installButton.classList.add('is-visible');
  }
});

installButton.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.classList.remove('is-visible');
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installButton.classList.remove('is-visible');
});

// Service worker registration keeps the app shell available after the first visit.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Nudge service worker registration failed:', error);
    });
  });
}
