/* =====================================================
   MANIFESTO MATCH — Scotland 2026
   Shared JS: data loading, helpers, nav
   ===================================================== */

const PARTY_FILES = ['lab', 'snp', 'con', 'ld', 'ref'];
let PARTIES = [];
let TOPICS  = [];
let _dataPromise = null;

/* ── DATA LOADING ──────────────────────────────────── */
async function loadData() {
  if (_dataPromise) return _dataPromise;
  _dataPromise = (async () => {
    const [topicsRes, ...partyRes] = await Promise.all([
      fetch('topics.json'),
      ...PARTY_FILES.map(id => fetch(`parties/${id}.json`))
    ]);

    if (!topicsRes.ok) throw new Error(`topics.json — HTTP ${topicsRes.status}`);
    const topicsData = await topicsRes.json();
    TOPICS = topicsData.topics || [];

    const partyData = await Promise.all(
      partyRes.map(async (res, i) => {
        if (!res.ok) { console.warn(`parties/${PARTY_FILES[i]}.json failed`); return null; }
        return res.json();
      })
    );

    const mergedParties = await Promise.all(
      partyData.map(async (p) => {
        if (!p) return null;
        if (!p.manifestoFile) return p;
        try {
          const mRes = await fetch(p.manifestoFile);
          if (!mRes.ok) throw new Error(`HTTP ${mRes.status}`);
          const m = await mRes.json();
          return {
            ...p,
            name:            m.party?.party_name           ?? p.name,
            short:           m.party?.party_short_name     ?? p.short,
            leader:          m.party?.party_leader         ?? p.leader,
            web:             m.party?.party_website        ?? p.web,
            manifestoUrl:    m.manifesto?.manifesto_url    ?? p.manifestoUrl,
            manifestoStatus: m.manifesto?.verified_for_target_election ? 'published' : p.manifestoStatus,
            estimated:       m.manifesto?.verified_for_target_election ? false : p.estimated,
            topicScores:     m.topicScores ?? p.topicScores
          };
        } catch (e) {
          console.warn(`Could not load ${p.manifestoFile} — using base data. (${e.message})`);
          return p;
        }
      })
    );

    PARTIES = mergedParties.filter(Boolean);

    // Merge party scores into topics for easy lookup
    TOPICS.forEach(t => {
      t.partyScores = {};
      PARTIES.forEach(p => {
        const s = p.topicScores || {};
        t.partyScores[p.id] = typeof s[t.id] === 'number' ? s[t.id] : 3;
      });
    });
  })();
  return _dataPromise;
}

/* ── ERROR SCREEN ──────────────────────────────────── */
function showLoadError(msg) {
  document.body.innerHTML = `
    <div style="padding:60px;text-align:center;font-family:sans-serif">
      <h2 style="color:#A5302A">Could not load data files</h2>
      <p style="color:#555;margin-top:12px">Make sure <code>topics.json</code> and the <code>parties/</code> folder sit alongside <code>index.html</code> and that you are viewing from a web server, not a local file.</p>
      <p style="color:#999;font-size:.85rem;margin-top:8px">Error: ${msg}</p>
    </div>`;
}

/* ── HELPERS ───────────────────────────────────────── */
const byId  = id => document.getElementById(id);
const party = id => PARTIES.find(p => p.id === id);
const topic = id => TOPICS.find(t => t.id === id);
const strLbl = n => ['','Slightly','Somewhat','Moderately','Very','Extremely'][n] || '';

function dirLabel(t, dir) {
  const ql = t.questionLabels || {};
  const d  = t.dirs || [];
  const s  = d[0] || ql.support || 'Support';
  const n  = d[1] || ql.neutral || 'Neutral';
  const o  = d[2] || ql.oppose  || 'Oppose';
  return dir === 'support' ? s : dir === 'oppose' ? o : n;
}

/* ── PARTY LOGO SVG ────────────────────────────────── */
function logo(partyId, sm) {
  const p = party(partyId); if (!p) return '';
  const c  = p.colour || p.c || {};
  const sz = sm ? 28 : 36, r = sm ? 6 : 8, fs = sm ? 8 : 9.5;
  const lbl = p.short.length > 5 ? p.short.slice(0,5) : p.short;
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;border-radius:${r}px;display:inline-block;vertical-align:middle">
    <rect width="${sz}" height="${sz}" rx="${r}" fill="${c.bg}" stroke="${c.border||c.bd||'#ccc'}" stroke-width="1.2"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
      font-family="'DM Sans',system-ui,sans-serif" font-weight="800" font-size="${fs}"
      fill="${c.fg}" letter-spacing="-0.3">${lbl}</text>
  </svg>`;
}

/* ── SITE LOGO SVG ─────────────────────────────────── */
const SITE_LOGO_SVG = `
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="34" height="34" rx="9" fill="#3D3530"/>
    <rect x="11" y="10" width="12" height="3.5" rx="1.75" fill="rgba(255,255,255,.2)"/>
    <rect x="13" y="3" width="8" height="11" rx="2" fill="#FFFFFF"/>
    <path d="M15 9L16.5 11L19 7" stroke="#3D3530" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="5" y="13" width="24" height="16" rx="3" fill="#4E4438"/>
    <circle cx="11" cy="21" r="1.5" fill="rgba(255,255,255,.3)"/>
    <circle cx="17" cy="21" r="1.5" fill="rgba(255,255,255,.3)"/>
    <circle cx="23" cy="21" r="1.5" fill="rgba(255,255,255,.3)"/>
    <rect x="9" y="25" width="16" height="1.5" rx=".75" fill="rgba(255,255,255,.15)"/>
  </svg>`;

/* ── NAV ───────────────────────────────────────────── */
// Call initNav(currentPageId) from each page
// pageId should match one of: home, match, parties, methodology, about, contact
function initNav(pageId) {
  const navLinks = [
    { id: 'home',        href: 'index.html',       label: 'Home' },
    { id: 'parties',     href: 'parties.html',     label: 'Parties' },
    { id: 'methodology', href: 'methodology.html', label: 'Methodology' },
    { id: 'about',       href: 'about.html',       label: 'About' },
    { id: 'contact',     href: 'contact.html',     label: 'Contact' }
  ];

  document.getElementById('nav-logo').innerHTML = SITE_LOGO_SVG;

  const ul = document.getElementById('nav-links');
  ul.innerHTML = navLinks.map(l => `
    <li><a href="${l.href}" class="${l.id === pageId ? 'active' : ''}">${l.label}</a></li>
  `).join('');
}

/* ── FOOTER ────────────────────────────────────────── */
function initFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <p>Manifesto Match – Scotland 2026 &nbsp;·&nbsp; Non-partisan voter information tool</p>
    <div class="footer-links">
      <a href="index.html">Home</a>
      <a href="parties.html">Parties</a>
      <a href="methodology.html">Methodology</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </div>
    <p style="margin-top:14px;font-size:.73rem">Not affiliated with any political party. All party scores are estimates until official manifestos are published.</p>`;
}
