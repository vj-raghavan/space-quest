// --- Space Quest — Cosmo 2.0 ---
// The mascot is drawn as inline SVG instead of a static image: a little
// alien floating in a space bubble. It blinks, bobs, waves, and changes
// expression with the gameplay (grin on correct, "oops" face on wrong)
// via mood-* classes set in setMascotExpression.

function mascotSVG(uid) {
  // Gradient ids must be unique per instance: duplicated ids resolve to the
  // first copy in the document, and if that copy sits inside a hidden
  // screen the gradient doesn't render at all.
  return `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="Cosmo the space alien">
  <defs>
    <radialGradient id="cosmoBody-${uid}" cx="42%" cy="32%" r="75%">
      <stop offset="0%" stop-color="#e7fff6"/>
      <stop offset="42%" stop-color="#7eebc8"/>
      <stop offset="100%" stop-color="#14967a"/>
    </radialGradient>
    <radialGradient id="cosmoBubble-${uid}" cx="32%" cy="28%" r="78%">
      <stop offset="0%" stop-color="rgba(210,245,255,0.42)"/>
      <stop offset="58%" stop-color="rgba(140,200,255,0.08)"/>
      <stop offset="100%" stop-color="rgba(80,120,220,0.04)"/>
    </radialGradient>
    <radialGradient id="cosmoBelly-${uid}" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#b6f3df"/>
    </radialGradient>
  </defs>

  <circle cx="100" cy="100" r="86" fill="rgba(8,14,32,0.18)"/>
  <circle cx="100" cy="100" r="84" fill="url(#cosmoBubble-${uid})" stroke="rgba(255,255,255,0.72)" stroke-width="3"/>
  <path d="M40 58 Q58 30 88 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
  <circle cx="46" cy="66" r="3" fill="#fff" opacity="0.85"/>

  <line x1="100" y1="52" x2="100" y2="26" stroke="#146b56" stroke-width="6" stroke-linecap="round"/>
  <circle class="m-antenna-tip" cx="100" cy="20" r="8" fill="#ffd25a" stroke="#241b3a" stroke-width="2"/>
  <circle cx="97" cy="17" r="2.2" fill="#fff"/>

  <ellipse cx="52" cy="118" rx="11" ry="18" fill="#2fb78f" stroke="#241b3a" stroke-width="2.2" transform="rotate(22 52 118)"/>
  <ellipse cx="46" cy="132" rx="8" ry="6" fill="#9df5d6" stroke="#241b3a" stroke-width="2"/>
  <g class="m-arm-r">
    <ellipse cx="148" cy="108" rx="11" ry="18" fill="#2fb78f" stroke="#241b3a" stroke-width="2.2" transform="rotate(-30 148 108)"/>
    <ellipse cx="156" cy="94" rx="8" ry="6" fill="#9df5d6" stroke="#241b3a" stroke-width="2"/>
  </g>

  <ellipse cx="82" cy="162" rx="14" ry="8" fill="#146b56" stroke="#241b3a" stroke-width="2"/>
  <ellipse cx="118" cy="162" rx="14" ry="8" fill="#146b56" stroke="#241b3a" stroke-width="2"/>

  <ellipse cx="100" cy="108" rx="46" ry="52" fill="#0f6e5c"/>
  <ellipse cx="100" cy="106" rx="45" ry="52" fill="url(#cosmoBody-${uid})" stroke="#241b3a" stroke-width="2.6"/>
  <ellipse cx="100" cy="128" rx="24" ry="16" fill="url(#cosmoBelly-${uid})"/>
  <path d="M100 118 l2.6 5.2 5.6.6-4.2 3.6 1.3 5.4L100 130.2 94.7 132.8l1.3-5.4-4.2-3.6 5.6-.6z" fill="#ffd25a" stroke="#b45309" stroke-width="0.6"/>

  <ellipse cx="70" cy="100" rx="7" ry="4.5" fill="#ff8fab" opacity="0.7"/>
  <ellipse cx="130" cy="100" rx="7" ry="4.5" fill="#ff8fab" opacity="0.7"/>

  <g class="m-eyes-normal">
    <g class="m-eye">
      <ellipse cx="84" cy="86" rx="9" ry="11" fill="#15203a"/>
      <ellipse cx="84" cy="87.5" rx="6.2" ry="7.6" fill="#2a3558"/>
      <circle cx="86.8" cy="82" r="3.2" fill="#fff"/>
      <circle cx="82.2" cy="90" r="1.5" fill="#9ad7ff"/>
    </g>
    <g class="m-eye">
      <ellipse cx="116" cy="86" rx="9" ry="11" fill="#15203a"/>
      <ellipse cx="116" cy="87.5" rx="6.2" ry="7.6" fill="#2a3558"/>
      <circle cx="118.8" cy="82" r="3.2" fill="#fff"/>
      <circle cx="114.2" cy="90" r="1.5" fill="#9ad7ff"/>
    </g>
  </g>

  <g class="m-eyes-happy">
    <path d="M74 90 Q84 76 94 90" fill="none" stroke="#15203a" stroke-width="5" stroke-linecap="round"/>
    <path d="M106 90 Q116 76 126 90" fill="none" stroke="#15203a" stroke-width="5" stroke-linecap="round"/>
  </g>

  <path class="m-smile" d="M88 106 Q100 116 112 106" fill="none" stroke="#15203a" stroke-width="4.5" stroke-linecap="round"/>
  <path class="m-grin" d="M84 104 Q100 126 116 104 Q100 110 84 104 Z" fill="#15203a"/>
  <circle class="m-o" cx="100" cy="110" r="7" fill="#15203a"/>
</svg>`;
}

// Replace every [data-mascot] placeholder with the SVG character
function initMascots() {
  document.querySelectorAll('[data-mascot]').forEach((el, i) => {
    el.innerHTML = mascotSVG(i);
  });
}

// Swap Cosmo's expression to match what just happened
function setMascotMood(type) {
  const containerId =
    type === 'setup' ? 'mascot-setup' :
    type === 'results' ? 'mascot-results' :
    type === 'family' ? 'mascot-family' : 'mascot-img';
  const el = document.getElementById(containerId);
  if (!el) return;

  el.classList.remove('mood-happy', 'mood-oops');
  if (type === 'correct' || type === 'family') el.classList.add('mood-happy');
  else if (type === 'incorrect') el.classList.add('mood-oops');

  if (type === 'correct' || type === 'incorrect') {
    clearTimeout(el._moodTimer);
    el._moodTimer = setTimeout(() => el.classList.remove('mood-happy', 'mood-oops'), 1800);
  }
}
