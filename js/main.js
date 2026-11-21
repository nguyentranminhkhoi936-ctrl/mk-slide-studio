import { initParticleEngine } from './three/particle-engine.js';
import { initFolderExplorer } from './components/folder-explorer.js';
import { initQuoteCalculator, applyPresetQuote } from './components/quote-calculator.js';

/* =========================================================================
   4. CUSTOM MAGNETIC CURSOR & TOAST HELPER
   ========================================================================= */
(function initMagneticCursor() {
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');
  if (!ring || !dot) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my, dx = mx, dy = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.interactive-el, a, button, input, label')) {
      ring.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.interactive-el, a, button, input, label')) {
      ring.classList.remove('cursor-hover');
    }
  });

  function tick() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    dx += (mx - dx) * 0.42;
    dy += (my - dy) * 0.42;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    dot.style.left = dx + 'px';
    dot.style.top = dy + 'px';
    requestAnimationFrame(tick);
  }
  tick();
})();

let toastTimer = null;
export function showToast(msg) {
  const el = document.getElementById('toast-notification');
  const txt = document.getElementById('toast-message');
  if (!el || !txt) return;
  txt.textContent = msg;
  el.classList.remove('opacity-0', 'translate-y-4');
  el.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.add('opacity-0', 'translate-y-4');
    el.classList.remove('opacity-100', 'translate-y-0');
  }, 2800);
}

export function copyTextSafe(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMsg))
      .catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Không thể sao chép tự động, vui lòng bôi đen để copy.');
  }
  document.body.removeChild(ta);
}

/* =========================================================================
   5. FULL-SCREEN NAVIGATION OVERLAY
   ========================================================================= */
const navOverlay = document.getElementById('nav-overlay');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const menuCloseBtn = document.getElementById('menu-close-btn');

function openNavOverlay() {
  navOverlay.classList.remove('opacity-0', 'pointer-events-none');
  navOverlay.classList.add('opacity-100', 'pointer-events-auto');
}
function closeNavOverlay() {
  navOverlay.classList.add('opacity-0', 'pointer-events-none');
  navOverlay.classList.remove('opacity-100', 'pointer-events-auto');
}

menuToggleBtn.addEventListener('click', openNavOverlay);
menuCloseBtn.addEventListener('click', closeNavOverlay);
document.querySelectorAll('.nav-overlay-link').forEach((link) => {
  link.addEventListener('click', closeNavOverlay);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeNavOverlay();
  }
});

/* =========================================================================
   6. GSAP + SCROLLTRIGGER REVEALS
   ========================================================================= */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-reveal', {
    y: 36,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
  });

  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.from(el, {
      y: 32,
      opacity: 0,
      duration: 0.75,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
    });
  });
}

/* =========================================================================
   APP BOOTSTRAP — INITIALIZE 3D ENGINE, QUOTE CALCULATOR & FOLDER EXPLORER
   ========================================================================= */
initParticleEngine();
initQuoteCalculator({ copyTextSafe, showToast });
initFolderExplorer({
  onOrderSimilar: (pricePerSlide, slideCount) => {
    applyPresetQuote(pricePerSlide, slideCount);
  },
  showToast,
});
