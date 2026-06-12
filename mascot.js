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
    <radialGradient id="cosmoBody-${uid}" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#9df5d6"/>
      <stop offset="100%" stop-color="#2fb78f"/>
    </radialGradient>
    <radialGradient id="cosmoBubble-${uid}" cx="35%" cy="30%" r="80%">
      <stop offset="0%" stop-color="rgba(170, 225, 255, 0.18)"/>
      <stop offset="100%" stop-color="rgba(120, 180, 255, 0.05)"/>
    </radialGradient>
  </defs>

  <!-- Space bubble -->
  <circle cx="100" cy="100" r="84" fill="url(#cosmoBubble-${uid})" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
  <path d="M 42 62 Q 56 36 84 28" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="5" stroke-linecap="round"/>

  <!-- Antenna -->
  <line x1="100" y1="50" x2="100" y2="28" stroke="#2fb78f" stroke-width="5" stroke-linecap="round"/>
  <circle class="m-antenna-tip" cx="100" cy="22" r="7" fill="#ffd25a"/>

  <!-- Arms (right one waves) -->
  <ellipse cx="54" cy="116" rx="9" ry="17" fill="#3cc9a0" transform="rotate(24 54 116)"/>
  <g class="m-arm-r">
    <ellipse cx="146" cy="106" rx="9" ry="17" fill="#3cc9a0" transform="rotate(-34 146 106)"/>
  </g>

  <!-- Feet -->
  <ellipse cx="84" cy="155" rx="11" ry="7" fill="#2fb78f"/>
  <ellipse cx="116" cy="155" rx="11" ry="7" fill="#2fb78f"/>

  <!-- Body -->
  <ellipse cx="100" cy="106" rx="45" ry="52" fill="url(#cosmoBody-${uid})"/>
  <ellipse cx="100" cy="128" rx="26" ry="19" fill="#cdf9e9" opacity="0.65"/>

  <!-- Cheeks -->
  <ellipse cx="74" cy="98" rx="6.5" ry="4.5" fill="#ff9bb0" opacity="0.55"/>
  <ellipse cx="126" cy="98" rx="6.5" ry="4.5" fill="#ff9bb0" opacity="0.55"/>

  <!-- Eyes: normal (blinking) -->
  <g class="m-eyes-normal">
    <g class="m-eye">
      <ellipse cx="84" cy="86" rx="8" ry="10" fill="#15203a"/>
      <circle cx="86.5" cy="82" r="3" fill="#ffffff"/>
    </g>
    <g class="m-eye">
      <ellipse cx="116" cy="86" rx="8" ry="10" fill="#15203a"/>
      <circle cx="118.5" cy="82" r="3" fill="#ffffff"/>
    </g>
  </g>

  <!-- Eyes: happy arcs (shown on correct answers) -->
  <g class="m-eyes-happy">
    <path d="M 75 89 Q 84 79 93 89" fill="none" stroke="#15203a" stroke-width="5" stroke-linecap="round"/>
    <path d="M 107 89 Q 116 79 125 89" fill="none" stroke="#15203a" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- Mouths -->
  <path class="m-smile" d="M 89 104 Q 100 113 111 104" fill="none" stroke="#15203a" stroke-width="4.5" stroke-linecap="round"/>
  <path class="m-grin" d="M 85 102 Q 100 124 115 102 Q 100 108 85 102 Z" fill="#15203a"/>
  <circle class="m-o" cx="100" cy="107" r="6.5" fill="#15203a"/>
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
    type === 'results' ? 'mascot-results' : 'mascot-img';
  const el = document.getElementById(containerId);
  if (!el) return;

  el.classList.remove('mood-happy', 'mood-oops');
  if (type === 'correct') el.classList.add('mood-happy');
  else if (type === 'incorrect') el.classList.add('mood-oops');

  if (type === 'correct' || type === 'incorrect') {
    clearTimeout(el._moodTimer);
    el._moodTimer = setTimeout(() => el.classList.remove('mood-happy', 'mood-oops'), 1800);
  }
}
