/* =====================================================
   POWER RANK BY SMURFIST — INTERACTIVE LOGIC
   ===================================================== */

// ===== Team data — VCT 2026 Masters London participants =====
// Logos go in assets/teams/{tag}.png — if missing, gradient fallback shows
const TEAMS = [
  {
    id: 'lev', name: 'Leviatán', short: 'LEV',
    logo: 'assets/teams/lev.png',
    color: '#1E40AF', color2: '#60A5FA',
    players: ['spikeziN', 'Sato', 'Neon', 'kiNgg', 'blowz'],
    coach: 'Onur',
  },
  {
    id: 'g2', name: 'G2 Esports', short: 'G2',
    logo: 'assets/teams/g2.png',
    color: '#1F2937', color2: '#9CA3AF',
    players: ['valyn', 'trent', 'leaf', 'jawgemo', 'babybay'],
    coach: 'JoshRT',
  },
  {
    id: 'edg', name: 'EDward Gaming', short: 'EDG',
    logo: 'assets/teams/edg.png',
    color: '#1A1A1A', color2: '#4B4B4B',
    players: ['ZmjjKK', 'Smoggy', 'nobody', 'Jieni7', 'CHICHOO'],
    coach: 'Autumn',
  },
  {
    id: 'xlg', name: 'XLG Esports', short: 'XLG',
    logo: 'assets/teams/xlg.png',
    color: '#DC2626', color2: '#F59E0B',
    players: ['WsLeo', 'Rarga', 'NoMan', 'Lysoar', 'happywei'],
    coach: 'hvoya',
  },
  {
    id: 'drg', name: 'Dragon Ranger Gaming', short: 'DRG',
    logo: 'assets/teams/drg.png',
    color: '#2563EB', color2: '#4ADE80',
    players: ['vo0kashu', 'Life', 'Nicc', 'SpiritZ1', 'Flex1n'],
    coach: 'NaThanD',
  },
  {
    id: 'th', name: 'Team Heretics', short: 'TH',
    logo: 'assets/teams/th.png',
    color: '#000000', color2: '#FFD700',
    players: ['Wo0t', 'RieNs', 'Koshmaras', 'Boo', 'benjyfishy'],
    coach: 'neilzinho',
  },
  {
    id: 'vit', name: 'Team Vitality', short: 'VIT',
    logo: 'assets/teams/vit.png',
    color: '#FFD700', color2: '#1F2937',
    players: ['Sayonara', 'PROFEK', 'Jamppi', 'Derke', 'Chronicle'],
    coach: 'PAL',
  },
  {
    id: 'fut', name: 'FUT Esports', short: 'FUT',
    logo: 'assets/teams/fut.png',
    color: '#0F172A', color2: '#EF4444',
    players: ['yetujey', 'xeus', 'sociablEE', 's0pp', 'KROSTALY'],
    coach: 'Vlad',
  },
  {
    id: 'prx', name: 'Paper Rex', short: 'PRX',
    logo: 'assets/teams/prx.png',
    color: '#EC4899', color2: '#8B5CF6',
    players: ['invy', 'd4v41', 'f0rsakeN', 'Jinggg', 'something'],
    coach: 'alecks',
  },
  {
    id: 'fs', name: 'FULL SENSE', short: 'FS',
    logo: 'assets/teams/fs.png',
    color: '#F97316', color2: '#1E1B3A',
    players: ['Leviathan', 'JitboyS', 'killua', 'Primmie', 'Crws'],
    coach: 'THEE',
  },
  {
    id: 'ge', name: 'Global Esports', short: 'GE',
    logo: 'assets/teams/ge.png',
    color: '#1E40AF', color2: '#DC2626',
    players: ['xavi8k', 'UdoTan', 'PatMen', 'Kr1stal', 'autumn'],
    coach: 'FrosT',
  },
  {
    id: 'nrg', name: 'NRG Esports', short: 'NRG',
    logo: 'assets/teams/nrg.png',
    color: '#FF4500', color2: '#1F2937',
    players: ['Ethan', 'mada', 'brawk', 'skuba', 'keiko'],
    coach: 'bonkar',
  },
];

// ===== Logo cache (for share-image export — embeds logos as base64) =====
const logoCache = {};
async function preloadLogo(url) {
  if (logoCache[url]) return logoCache[url];
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoCache[url] = reader.result;
        resolve(reader.result);
      };
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}
async function preloadAllLogos() {
  await Promise.all([
    preloadLogo('assets/logo.png'),
    ...TEAMS.map(t => preloadLogo(t.logo)),
  ]);
}

// ===== State =====
const state = {
  ranking: new Array(12).fill(null), // index 0 = rank 1
  nickname: '',
  favoriteId: '',
  activeSlot: null,
};

// ===== DOM refs =====
const $ = (sel) => document.querySelector(sel);
const rankListLeft  = $('#rankListLeft');
const rankListRight = $('#rankListRight');
const nicknameInput = $('#nickname');
const favSelect     = $('#favTeam');
const previewNick   = $('#previewNick');
const previewFav    = $('#previewFav');
const previewFilled = $('#previewFilled');
const progressRing  = $('#progressRing');
const progressCount = $('#progressCount');
const teamModal     = $('#teamModal');
const teamGrid      = $('#teamGrid');
const teamSearch    = $('#teamSearch');
const modalSlot     = $('#modalSlot');
const shareCard     = $('#shareCard');
const shareActions  = $('#shareActions');
const toastStack    = $('#toastStack');

// ===== Utilities =====
const teamById = (id) => TEAMS.find(t => t.id === id);
const filledCount = () => state.ranking.filter(Boolean).length;
const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// ===== Toast =====
function toast(message, type = 'info') {
  const icons = {
    info:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    danger:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  };

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <span>${escapeHtml(message)}</span>
  `;
  toastStack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s, transform .25s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    setTimeout(() => el.remove(), 260);
  }, 3000);
}

// ===== Build team logo HTML =====
// Renders <img> if logo file exists; falls back to gradient + tag text on error
function teamLogoHTML(team, size = 'md') {
  const sizes = { sm: 32, md: 52, lg: 64 };
  const fontSizes = { sm: 11, md: 16, lg: 20 };
  const px = sizes[size];
  const imgTag = team.logo
    ? `<img src="${team.logo}" alt="${escapeHtml(team.name)} logo"
            class="slot__logo-img"
            onerror="this.style.display='none';this.parentElement.classList.add('slot__logo--fallback');" />`
    : '';
  return `
    <div class="slot__logo ${team.logo ? '' : 'slot__logo--fallback'}"
         style="width:${px}px;height:${px}px;
                --logo-grad:linear-gradient(135deg, ${team.color} 0%, ${team.color2} 100%);
                font-size:${fontSizes[size]}px;">
      <span class="slot__logo-text">${escapeHtml(team.short)}</span>
      ${imgTag}
    </div>
  `;
}

// ===== Build rank slot HTML =====
function emptySlotHTML(rank) {
  return `
    <button type="button" class="slot slot--empty" data-rank="${rank}" data-action="open-modal"
            aria-label="Pick team for rank ${rank}">
      <div class="slot__rank">
        <span class="slot__rank-label">Rank</span>
        <span class="slot__rank-num">${rank}</span>
      </div>
      <div class="slot-empty__content">
        <div class="slot-empty__plus" aria-hidden="true">+</div>
        <span class="slot-empty__hint">Click to assign team</span>
      </div>
    </button>
  `;
}
function filledSlotHTML(rank, team, isFav) {
  const players = team.players.map(p => `<span class="slot__player">${escapeHtml(p)}</span>`).join('');
  const top3 = rank <= 3 ? 'slot--top3' : '';
  const favClass = isFav ? 'slot--fav' : '';
  const favBadge = isFav
    ? '<span class="slot__badge slot__badge--fav">★ Favorite</span>'
    : '';
  return `
    <div class="slot slot--filled ${top3} ${favClass}" data-rank="${rank}">
      <div class="slot__rank">
        <span class="slot__rank-label">Rank</span>
        <span class="slot__rank-num">${rank}</span>
      </div>
      <div class="slot-filled__content">
        ${teamLogoHTML(team)}
        <div class="slot__info">
          <div class="slot__team-row">
            <span class="slot__name">${escapeHtml(team.name)}</span>
            <span class="slot__badge">Selected</span>
            ${favBadge}
          </div>
          <div class="slot__players">${players}</div>
          <div class="slot__coach"><strong>Coach:</strong> ${escapeHtml(team.coach)}</div>
        </div>
        <div class="slot__actions">
          <button type="button" class="icon-btn" data-action="change" data-rank="${rank}" aria-label="Change team at rank ${rank}" title="Change">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <button type="button" class="icon-btn icon-btn--danger" data-action="remove" data-rank="${rank}" aria-label="Remove team at rank ${rank}" title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===== Render =====
function render() {
  // Render both columns
  const leftHtml = [];
  const rightHtml = [];
  state.ranking.forEach((teamId, idx) => {
    const rank = idx + 1;
    const team = teamId ? teamById(teamId) : null;
    const isFav = team && team.id === state.favoriteId;
    const html = team ? filledSlotHTML(rank, team, isFav) : emptySlotHTML(rank);
    if (rank <= 6) leftHtml.push(html);
    else rightHtml.push(html);
  });
  rankListLeft.innerHTML = leftHtml.join('');
  rankListRight.innerHTML = rightHtml.join('');

  // Progress
  const count = filledCount();
  progressCount.textContent = count;
  previewFilled.textContent = count;
  // Circumference for r=44 = 2 * PI * 44 ≈ 276.46
  const C = 2 * Math.PI * 44;
  progressRing.style.strokeDasharray = C;
  progressRing.style.strokeDashoffset = C - (count / 12) * C;
  // Color shift as it fills
  if (count === 12) {
    progressRing.style.stroke = '#10B981';
  } else if (count >= 6) {
    progressRing.style.stroke = '#22D3EE';
  } else {
    progressRing.style.stroke = '#7C3AED';
  }

  // Preview
  previewNick.textContent = state.nickname || '—';
  const favTeam = teamById(state.favoriteId);
  previewFav.textContent = favTeam ? favTeam.name : '—';
}

// ===== Populate favorite team dropdown =====
function populateFavDropdown() {
  const opts = ['<option value="">— Choose your team —</option>'];
  TEAMS.forEach(t => {
    opts.push(`<option value="${t.id}">${escapeHtml(t.name)}</option>`);
  });
  favSelect.innerHTML = opts.join('');
}

// ===== Modal =====
function openTeamModal(rank) {
  state.activeSlot = rank;
  modalSlot.textContent = `#${rank}`;
  renderTeamGrid();
  teamSearch.value = '';
  teamModal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => teamSearch.focus(), 100);
}
function closeTeamModal() {
  teamModal.hidden = true;
  state.activeSlot = null;
  document.body.style.overflow = '';
}
function renderTeamGrid(filter = '') {
  const q = filter.trim().toLowerCase();
  const selectedIds = new Set(state.ranking.filter(Boolean));
  // Allow re-selecting the team currently in the slot we're editing (so user can keep it)
  const currentInSlot = state.activeSlot ? state.ranking[state.activeSlot - 1] : null;
  if (currentInSlot) selectedIds.delete(currentInSlot);

  const matches = TEAMS.filter(t => {
    if (!q) return true;
    return t.name.toLowerCase().includes(q)
      || t.coach.toLowerCase().includes(q)
      || t.players.some(p => p.toLowerCase().includes(q));
  });

  if (matches.length === 0) {
    teamGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:32px 16px;color:var(--text-muted);font-size:14px;">
        No teams match "${escapeHtml(filter)}"
      </div>
    `;
    return;
  }

  teamGrid.innerHTML = matches.map(t => {
    const taken = selectedIds.has(t.id);
    const imgTag = t.logo
      ? `<img src="${t.logo}" alt="${escapeHtml(t.name)}"
              class="team-card__logo-img"
              onerror="this.style.display='none';this.parentElement.classList.add('team-card__logo--fallback');" />`
      : '';
    return `
      <button type="button"
              class="team-card ${taken ? 'team-card--disabled' : ''}"
              data-team-id="${t.id}"
              ${taken ? 'disabled aria-disabled="true"' : ''}>
        <div class="team-card__logo ${t.logo ? '' : 'team-card__logo--fallback'}"
             style="--logo-grad:linear-gradient(135deg, ${t.color} 0%, ${t.color2} 100%);">
          <span class="team-card__logo-text">${escapeHtml(t.short)}</span>
          ${imgTag}
        </div>
        <div class="team-card__info">
          <div class="team-card__name">${escapeHtml(t.name)}</div>
        </div>
      </button>
    `;
  }).join('');
}

function assignTeamToSlot(teamId) {
  if (!state.activeSlot) return;
  const idx = state.activeSlot - 1;

  // If team already exists somewhere else, swap
  const existingIdx = state.ranking.indexOf(teamId);
  if (existingIdx !== -1 && existingIdx !== idx) {
    // swap so other slot becomes empty (or keep original if you'd prefer to block)
    state.ranking[existingIdx] = state.ranking[idx]; // could be null
  }

  state.ranking[idx] = teamId;
  closeTeamModal();
  render();
  const team = teamById(teamId);
  toast(`${team.name} placed at rank ${idx + 1}`, 'success');
}

function removeAtRank(rank) {
  const idx = rank - 1;
  const teamId = state.ranking[idx];
  if (!teamId) return;
  const team = teamById(teamId);
  state.ranking[idx] = null;
  render();
  toast(`Removed ${team.name} from rank ${rank}`, 'info');
}

// ===== Reset =====
function resetRanking() {
  if (filledCount() === 0) {
    toast('Ranking is already empty', 'info');
    return;
  }
  if (!confirm('Reset all rankings? This cannot be undone.')) return;
  state.ranking = new Array(12).fill(null);
  render();
  shareActions.hidden = true;
  shareCard.innerHTML = `
    <div class="share-card__placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
      <p>Fill in your ranking and click <strong>Generate Share Image</strong> to preview your card here.</p>
    </div>
  `;
  toast('Ranking reset', 'success');
}

// ===== Share text =====
function buildShareText() {
  const lines = [`My Power Rank by Smurfist:`];
  state.ranking.forEach((teamId, idx) => {
    const team = teamId ? teamById(teamId) : null;
    lines.push(`${idx + 1}. ${team ? team.name : '—'}`);
  });
  if (state.nickname) lines.push(`\n— ${state.nickname}`);
  const fav = teamById(state.favoriteId);
  if (fav) lines.push(`Fav: ${fav.name}`);
  lines.push(`\n#Smurfist #PowerRank`);
  return lines.join('\n');
}

async function copyShareText() {
  const count = filledCount();
  if (count < 12) {
    toast(`Fill all 12 ranks first (${count}/12). Text will include empty slots as "—".`, 'warning');
  }
  const text = buildShareText();
  try {
    await navigator.clipboard.writeText(text);
    toast('Share text copied to clipboard!', 'success');
  } catch (err) {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('Share text copied to clipboard!', 'success');
    } catch {
      toast('Could not copy automatically. Select and copy manually.', 'danger');
    }
    document.body.removeChild(ta);
  }
}

// ===== Generate share image (HTML card preview) =====
async function generateShareGraphic() {
  const count = filledCount();
  if (count < 12) {
    toast(`Add ${12 - count} more team${12 - count > 1 ? 's' : ''} to generate a full share card.`, 'warning');
  }

  // Preload all logos as base64 so they appear in the preview AND survive PNG export
  await preloadAllLogos();

  const nick = state.nickname || 'Anonymous';
  const fav = teamById(state.favoriteId);
  const brandLogoSrc = logoCache['assets/logo.png'] || 'assets/logo.png';

  const rowsHtml = state.ranking.map((teamId, idx) => {
    const rank = idx + 1;
    const team = teamId ? teamById(teamId) : null;
    const isFav = team && team.id === state.favoriteId;
    if (team) {
      const logoSrc = logoCache[team.logo] || team.logo;
      return `
        <div class="share-graphic__row ${isFav ? 'share-graphic__row--fav' : ''}" data-rank="${rank}">
          <div class="share-graphic__row-rank">${rank}</div>
          <div class="share-graphic__row-logo"><img src="${logoSrc}" alt="" /></div>
          <div class="share-graphic__row-name">${escapeHtml(team.name)}${isFav ? ' ★' : ''}</div>
        </div>
      `;
    }
    return `
      <div class="share-graphic__row share-graphic__row--empty" data-rank="${rank}">
        <div class="share-graphic__row-rank">${rank}</div>
        <div class="share-graphic__row-logo"></div>
        <div class="share-graphic__row-name">— empty —</div>
      </div>
    `;
  }).join('');

  shareCard.innerHTML = `
    <div class="share-graphic" id="shareGraphic">
      <div class="share-graphic__head">
        <img src="${brandLogoSrc}" alt="Smurfist" class="share-graphic__logo" />
        <div>
          <div class="share-graphic__title">Power Rank <span>by Smurfist</span></div>
          <div class="share-graphic__subtitle">Esports Power Ranking</div>
        </div>
      </div>
      <div class="share-graphic__meta">
        <div class="share-graphic__meta-item">
          <span class="share-graphic__meta-key">Created by</span>
          <span class="share-graphic__meta-val">${escapeHtml(nick)}</span>
        </div>
        <div class="share-graphic__meta-item">
          <span class="share-graphic__meta-key">Favorite</span>
          <span class="share-graphic__meta-val">${fav ? escapeHtml(fav.name) : '—'}</span>
        </div>
        <div class="share-graphic__meta-item">
          <span class="share-graphic__meta-key">Completion</span>
          <span class="share-graphic__meta-val">${count}/12</span>
        </div>
      </div>
      <div class="share-graphic__list">${rowsHtml}</div>
      <div class="share-graphic__foot">
        <span>#Smurfist · #PowerRank</span>
        <span>smurfist.gg</span>
      </div>
    </div>
  `;
  shareActions.hidden = false;
  shareCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  toast('Share card generated. Right-click → Save image, or download as PNG.', 'success');
}

// ===== Download share card as PNG =====
async function downloadShareAsPNG() {
  const node = document.getElementById('shareGraphic');
  if (!node) {
    toast('Generate the share card first.', 'warning');
    return;
  }

  try {
    // Use SVG-based foreignObject to rasterize HTML to canvas without external libs
    const rect = node.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    const scale = 2;

    // Inline all CSS into the cloned node
    const clone = node.cloneNode(true);
    const cssText = await collectStyles();

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, sans-serif;">
            <style>${cssText}</style>
            ${new XMLSerializer().serializeToString(clone)}
          </div>
        </foreignObject>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#14132A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (!b) {
          toast('PNG export failed. Use a screenshot instead.', 'danger');
          return;
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(b);
        link.download = `power-rank-${(state.nickname || 'smurfist').toLowerCase().replace(/\s+/g, '-')}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        toast('Image downloaded!', 'success');
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast('Browser blocked rendering. Try a screenshot of the preview instead.', 'warning');
    };
    img.src = url;
  } catch (err) {
    console.error(err);
    toast('Could not generate PNG. Screenshot the preview instead.', 'danger');
  }
}

async function collectStyles() {
  // Grab all <style> and <link rel="stylesheet"> content
  let css = '';
  for (const sheet of document.styleSheets) {
    try {
      if (sheet.cssRules) {
        for (const rule of sheet.cssRules) css += rule.cssText + '\n';
      }
    } catch {
      // Cross-origin stylesheet — try fetching if it's our own
      if (sheet.href && sheet.href.startsWith(window.location.origin)) {
        try {
          const res = await fetch(sheet.href);
          css += await res.text();
        } catch {}
      }
    }
  }
  return css;
}

// ===== Event listeners =====
function bindEvents() {
  // Click on rank slots / actions
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    const rank = Number(trigger.dataset.rank);

    if (action === 'open-modal') openTeamModal(rank);
    else if (action === 'change') openTeamModal(rank);
    else if (action === 'remove') removeAtRank(rank);
  });

  // Team selection inside modal
  teamGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.team-card:not(.team-card--disabled)');
    if (!card) return;
    const teamId = card.dataset.teamId;
    assignTeamToSlot(teamId);
  });

  // Modal close
  document.querySelectorAll('[data-close-modal]').forEach(el =>
    el.addEventListener('click', closeTeamModal)
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !teamModal.hidden) closeTeamModal();
  });

  // Search inside modal
  teamSearch.addEventListener('input', (e) => renderTeamGrid(e.target.value));

  // Inputs
  nicknameInput.addEventListener('input', (e) => {
    state.nickname = e.target.value.trim();
    previewNick.textContent = state.nickname || '—';
  });
  favSelect.addEventListener('change', (e) => {
    state.favoriteId = e.target.value;
    render();
  });

  // Buttons
  $('#btnReset').addEventListener('click', resetRanking);
  $('#btnCopyText').addEventListener('click', copyShareText);
  $('#btnShareImage').addEventListener('click', generateShareGraphic);
  $('#btnDownloadImage').addEventListener('click', downloadShareAsPNG);

  // Year
  $('#year').textContent = new Date().getFullYear();
}

// ===== Init =====
function init() {
  populateFavDropdown();
  bindEvents();
  render();
  // Warm the logo cache in the background so share-image generation is instant
  preloadAllLogos().catch(() => { /* silent — falls back to URL src */ });
}

document.addEventListener('DOMContentLoaded', init);
