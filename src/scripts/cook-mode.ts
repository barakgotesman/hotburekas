// Cook mode: larger text (via html[data-cook-mode] in global.css) and a screen that stays awake.
// Toggled by `[data-cook-toggle]` buttons; `?cook=1` in the URL starts with it on.

/** Active wake lock, if the browser granted one. Typed loosely: WakeLockSentinel isn't in all TS libs. */
let wakeLock: { release: () => Promise<void> } | null = null;

/** Requests a screen wake lock (feature-detected; failures such as low battery are ignored). */
async function acquireWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch {
    wakeLock = null;
  }
}

/** Releases the wake lock if we hold one. */
async function releaseWakeLock() {
  await wakeLock?.release().catch(() => {});
  wakeLock = null;
}

/**
 * Turns cook mode on or off and keeps buttons' aria-pressed in sync.
 * @param on Whether cook mode should be active.
 */
function setCookMode(on: boolean) {
  document.documentElement.toggleAttribute('data-cook-mode', on);
  document.querySelectorAll('[data-cook-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
  if (on) void acquireWakeLock();
  else void releaseWakeLock();
}

document.querySelectorAll('[data-cook-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => setCookMode(!document.documentElement.hasAttribute('data-cook-mode')));
});

// The browser drops the lock when the tab is hidden; ask again when the cook comes back.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && document.documentElement.hasAttribute('data-cook-mode')) {
    void acquireWakeLock();
  }
});

if (new URLSearchParams(location.search).get('cook') === '1') setCookMode(true);
