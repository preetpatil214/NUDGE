(() => {
  let deferredPrompt;

  document.documentElement.style.touchAction = "pan-y";
  document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
  document.addEventListener("gesturechange", (event) => event.preventDefault(), { passive: false });
  document.addEventListener("gestureend", (event) => event.preventDefault(), { passive: false });
  document.addEventListener("touchmove", (event) => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });
  document.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.metaKey) event.preventDefault();
  }, { passive: false });

  const style = document.createElement("style");
  style.textContent = `
    .nudge-install-backdrop {
      position: fixed; inset: 0; z-index: 100;
      display: grid; place-items: center; padding: 22px;
      background: rgba(4, 5, 16, .58); backdrop-filter: blur(8px);
      animation: nudge-install-fade 220ms ease-out both;
    }
    .nudge-install-dialog {
      position: relative; width: min(100%, 340px); max-height: calc(100dvh - 44px); overflow-y: auto; padding: 24px 22px 20px;
      border: 1px solid rgba(255,255,255,.22); border-radius: 22px;
      background: linear-gradient(145deg, rgba(36, 25, 65, .94), rgba(17, 35, 68, .94));
      box-shadow: 0 18px 55px rgba(0,0,0,.42), 0 0 28px rgba(144,113,255,.2), inset 0 1px rgba(255,255,255,.12);
      color: #fff; font-family: Inter, Arial, sans-serif;
    }
    .nudge-install-dialog::before {
      content: ""; position: absolute; z-index: -1; inset: 12px -5px -8px;
      border-radius: inherit; background: linear-gradient(110deg, rgba(234,72,151,.4), rgba(144,113,255,.3) 50%, rgba(61,185,222,.38));
      filter: blur(18px); opacity: .7;
    }
    .nudge-install-kicker { margin: 0 0 8px; color: #c9c1ff; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .nudge-install-dialog h2 { margin: 0 0 8px; font-size: 22px; line-height: 1.15; }
    .nudge-install-dialog p { margin: 0 0 18px; color: rgba(255,255,255,.72); font-size: 13px; line-height: 1.45; }
    .nudge-install-actions { display: flex; flex-wrap: wrap; gap: 9px; justify-content: flex-end; }
    .nudge-install-actions button { border: 0; border-radius: 999px; padding: 10px 15px; color: #fff; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
    .nudge-install-dismiss { background: rgba(255,255,255,.1); }
    .nudge-install-confirm { background: linear-gradient(110deg, rgba(234,72,151,.72), rgba(144,113,255,.68) 52%, rgba(61,185,222,.72)); box-shadow: 0 6px 16px rgba(7,5,22,.24), inset 0 1px rgba(255,255,255,.16); }
    .nudge-install-actions button:hover, .nudge-install-actions button:focus-visible { filter: brightness(1.12); transform: translateY(-1px); }
    @keyframes nudge-install-fade { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .nudge-install-backdrop { animation: none; } }
  `;
  document.head.appendChild(style);

  function isInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function closeInstallPrompt(backdrop) {
    backdrop?.remove();
  }

  function showInstallPrompt() {
    if (!deferredPrompt || isInstalled() || document.querySelector(".nudge-install-backdrop")) return;

    const backdrop = document.createElement("div");
    backdrop.className = "nudge-install-backdrop";
    backdrop.innerHTML = `
      <section class="nudge-install-dialog" role="dialog" aria-modal="true" aria-labelledby="nudge-install-title">
        <p class="nudge-install-kicker">Nudge app</p>
        <h2 id="nudge-install-title">Install Nudge</h2>
        <p>Keep your study plans close with a faster, app-like experience.</p>
        <div class="nudge-install-actions">
          <button class="nudge-install-dismiss" type="button">Maybe later</button>
          <button class="nudge-install-confirm" type="button">Install app</button>
        </div>
      </section>
    `;

    const dialog = backdrop.querySelector(".nudge-install-dialog");
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeInstallPrompt(backdrop);
    });
    backdrop.querySelector(".nudge-install-dismiss").addEventListener("click", () => closeInstallPrompt(backdrop));
    backdrop.querySelector(".nudge-install-confirm").addEventListener("click", async () => {
      const promptEvent = deferredPrompt;
      closeInstallPrompt(backdrop);
      deferredPrompt = null;
      promptEvent.prompt();
      await promptEvent.userChoice;
    });
    document.body.appendChild(backdrop);
    dialog.querySelector(".nudge-install-dismiss").focus();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallPrompt();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    closeInstallPrompt(document.querySelector(".nudge-install-backdrop"));
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Nudge service worker registration failed:", error);
      });
    });
  }
})();
