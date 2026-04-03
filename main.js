/* =====================================================
   MANIFESTO MATCH — Scotland 2026
   Shared JS: data loading, helpers, nav, footer

   Data strategy:
   - Tries to fetch topics.json + parties/*.json from server
   - If fetch fails (e.g. local file:// testing), falls back
     to INLINE_DATA embedded below
   - On Vercel, fetch always works and JSON files are
     the authoritative source
   ===================================================== */

/* ── INLINE FALLBACK DATA ──────────────────────────────
   Mirrors topics.json and the five party files.
   Used automatically when JSON files cannot be fetched.
   Keep this in sync when you update the JSON files.
   ─────────────────────────────────────────────────── */
const INLINE_DATA = {
  topics: [
    {
      id: 'independence', name: 'Scottish Independence', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      desc: 'Scotland becoming an independent country',
      questionLabels: { support: 'Yes to independence', neutral: 'Undecided', oppose: 'No to independence' }
    },
    {
      id: 'nhs', name: 'NHS & Healthcare', icon: '🏥',
      desc: 'NHS investment, waiting times, mental health services',
      questionLabels: { support: 'Increase investment', neutral: 'Keep as is', oppose: 'Reduce / reform' }
    },
    {
      id: 'education', name: 'Education', icon: '🎓',
      desc: 'Schools, free university tuition, curriculum reform',
      questionLabels: { support: 'Increase investment', neutral: 'Keep as is', oppose: 'Reduce / reform' }
    },
    {
      id: 'climate', name: 'Climate & Environment', icon: '🌍',
      desc: 'Net zero targets, renewables, environmental protection',
      questionLabels: { support: 'Prioritise action', neutral: 'Balanced approach', oppose: 'Deprioritise' }
    },
    {
      id: 'economy', name: 'Economy & Jobs', icon: '💼',
      desc: 'Growth, employment, business support, wages',
      questionLabels: { support: 'State-led growth', neutral: 'Balanced approach', oppose: 'Market-led growth' }
    },
    {
      id: 'housing', name: 'Housing & Homelessness', icon: '🏠',
      desc: 'Affordable housing, rent controls, social housing',
      questionLabels: { support: 'More social housing', neutral: 'Balanced approach', oppose: 'Market-led supply' }
    },
    {
      id: 'costliving', name: 'Cost of Living', icon: '🛒',
      desc: 'Household bills, benefits, tackling rising prices',
      questionLabels: { support: 'More government support', neutral: 'Targeted support', oppose: 'Reduce intervention' }
    },
    {
      id: 'transport', name: 'Public Transport', icon: '🚆',
      desc: 'Rail, buses, active travel, rural connectivity',
      questionLabels: { support: 'Expand & invest', neutral: 'Keep as is', oppose: 'Reduce subsidy' }
    },
    {
      id: 'socialcare', name: 'Social Care', icon: '👴',
      desc: 'Elderly care, disability support, carers, free personal care',
      questionLabels: { support: 'Increase investment', neutral: 'Keep as is', oppose: 'Reform / reduce' }
    },
    {
      id: 'drugs', name: 'Drug Policy Reform', icon: '💊',
      desc: 'Tackling drug deaths, treatment services, harm reduction',
      questionLabels: { support: 'Decriminalise / treat', neutral: 'Current approach', oppose: 'Tougher enforcement' }
    },
    {
      id: 'landreform', name: 'Land Reform', icon: '🌾',
      desc: 'Community land ownership, diversifying land ownership',
      questionLabels: { support: 'More reform', neutral: 'Some reform', oppose: 'Protect current ownership' }
    },
    {
      id: 'policing', name: 'Policing & Justice', icon: '⚖️',
      desc: 'Police Scotland, criminal justice, community safety',
      questionLabels: { support: 'More police & powers', neutral: 'Current approach', oppose: 'Reform-focused' }
    },
    {
      id: 'energy', name: 'Energy Policy', icon: '⚡',
      desc: 'Renewables, oil & gas transition, energy costs',
      questionLabels: { support: 'Renewables-first', neutral: 'Balanced transition', oppose: 'Support oil & gas' }
    },
    {
      id: 'equality', name: 'Equality & Rights', icon: '🏳️‍🌈',
      desc: 'LGBTQ+ rights, gender equality, disability rights',
      questionLabels: { support: 'Strengthen protections', neutral: 'Current approach', oppose: 'Roll back' }
    },
    {
      id: 'rural', name: 'Rural Affairs & Farming', icon: '🐄',
      desc: 'Agricultural support, rural communities, fishing',
      questionLabels: { support: 'More rural support', neutral: 'Keep as is', oppose: 'Reduce subsidies' }
    },
    {
      id: 'immigration', name: 'Immigration & Borders', icon: '🛂',
      desc: 'Immigration policy, asylum seekers, border control',
      questionLabels: { support: 'More open policy', neutral: 'Managed approach', oppose: 'Stricter controls' }
    },
    {
      id: 'tax', name: 'Tax & Public Spending', icon: '💰',
      desc: 'Income tax rates, council tax, public spending levels',
      questionLabels: { support: 'Higher tax & spend', neutral: 'Balanced approach', oppose: 'Lower tax & spend' }
    }
  ],

  parties: [
    {
      id: 'lab', name: 'Scottish Labour', short: 'Labour',
      leader: 'Anas Sarwar MSP', web: 'https://www.scottishlabour.org.uk',
      manifestoStatus: 'pending', manifestoUrl: null, estimated: true,
      colour: { bg: '#E4003B', fg: '#FFFFFF', border: '#B80030' },
      topicScores: {
        independence:1, nhs:5, education:4, climate:4, economy:4,
        housing:4, costliving:5, transport:4, socialcare:5, drugs:4,
        landreform:4, policing:4, energy:3, equality:4, rural:3,
        immigration:3, tax:4
      }
    },
    {
      id: 'snp', name: 'Scottish National Party', short: 'SNP',
      leader: 'John Swinney MSP', web: 'https://www.snp.org',
      manifestoStatus: 'pending', manifestoUrl: null, estimated: true,
      colour: { bg: '#FFF060', fg: '#000000', border: '#CCBB00' },
      topicScores: {
        independence:5, nhs:4, education:4, climate:4, economy:3,
        housing:3, costliving:3, transport:3, socialcare:4, drugs:4,
        landreform:3, policing:3, energy:4, equality:4, rural:3,
        immigration:4, tax:3
      }
    },
    {
      id: 'con', name: 'Scottish Conservative Party', short: 'Con',
      leader: 'Russell Findlay MSP', web: 'https://www.scottishconservatives.com',
      manifestoStatus: 'pending', manifestoUrl: null, estimated: true,
      colour: { bg: '#003087', fg: '#FFFFFF', border: '#001E5E' },
      topicScores: {
        independence:1, nhs:3, education:3, climate:2, economy:4,
        housing:2, costliving:3, transport:2, socialcare:3, drugs:2,
        landreform:2, policing:4, energy:4, equality:2, rural:4,
        immigration:2, tax:2
      }
    },
    {
      id: 'ld', name: 'Scottish Liberal Democrats', short: 'LD',
      leader: 'Alex Cole-Hamilton MSP', web: 'https://www.scotlibdems.org.uk',
      manifestoStatus: 'pending', manifestoUrl: null, estimated: true,
      colour: { bg: '#FAA61A', fg: '#FFFFFF', border: '#D88500' },
      topicScores: {
        independence:2, nhs:4, education:4, climate:4, economy:3,
        housing:3, costliving:4, transport:4, socialcare:4, drugs:4,
        landreform:3, policing:3, energy:4, equality:4, rural:3,
        immigration:3, tax:3
      }
    },
    {
      id: 'ref', name: 'Reform UK Scotland', short: 'Reform',
      leader: 'Malcolm Offord', web: 'https://reformuk.scot',
      manifestoStatus: 'published',
      manifestoUrl: 'https://www.reformparty.uk/scotland-manifesto.pdf',
      estimated: false,
      colour: { bg: '#12B6DF', fg: '#FFFFFF', border: '#0994BA' },
      topicScores: {
        independence:1, nhs:4, education:3, climate:1, economy:5,
        housing:4, costliving:4, transport:3, socialcare:4, drugs:1,
        landreform:1, policing:5, energy:2, equality:1, rural:4,
        immigration:1, tax:5
      }
    }
  ]
};

/* ── RUNTIME STATE ─────────────────────────────────── */
const PARTY_FILES = ['lab', 'snp', 'con', 'ld', 'ref'];
let PARTIES = [];
let TOPICS  = [];
let _dataPromise = null;

/* ── DATA LOADING ──────────────────────────────────── */
async function loadData() {
  if (_dataPromise) return _dataPromise;
  _dataPromise = (async () => {

    try {
      // Attempt to load from JSON files (works on Vercel / any web server)
      const [topicsRes, ...partyRes] = await Promise.all([
        fetch('topics.json'),
        ...PARTY_FILES.map(id => fetch(`parties/${id}.json`))
      ]);

      if (!topicsRes.ok) throw new Error('topics.json not found');
      const topicsData = await topicsRes.json();
      TOPICS = topicsData.topics || [];

      const partyData = await Promise.all(
        partyRes.map(async (res, i) => {
          if (!res.ok) { console.warn(`parties/${PARTY_FILES[i]}.json not found`); return null; }
          return res.json();
        })
      );

      // Merge manifesto override files where present
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
            console.warn(`Could not load ${p.manifestoFile} — using base data`);
            return p;
          }
        })
      );

      PARTIES = mergedParties.filter(Boolean);
      console.info('Manifesto Match: data loaded from JSON files');

    } catch (e) {
      // Fallback: use data embedded above (works when opening files locally)
      console.info('Manifesto Match: using inline fallback data (' + e.message + ')');
      TOPICS  = INLINE_DATA.topics;
      PARTIES = INLINE_DATA.parties;
    }

    // Build partyScores lookup on each topic
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
      <h2 style="color:#A5302A">Could not load data</h2>
      <p style="color:#555;margin-top:12px">Something went wrong loading the site data.</p>
      <p style="color:#999;font-size:.85rem;margin-top:8px">Error: ${msg}</p>
    </div>`;
}

/* ── HELPERS ───────────────────────────────────────── */
const byId   = id => document.getElementById(id);
const party  = id => PARTIES.find(p => p.id === id);
const topic  = id => TOPICS.find(t => t.id === id);
const strLbl = n  => ['','Slightly','Somewhat','Moderately','Very','Extremely'][n] || '';

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
function initNav(pageId) {
  const navLinks = [
    { id: 'home',        href: 'index.html',       label: 'Home' },
    { id: 'parties',     href: 'parties.html',     label: 'Parties' },
    { id: 'methodology', href: 'methodology.html', label: 'Methodology' },
    { id: 'about',       href: 'about.html',       label: 'About' },
    { id: 'contact',     href: 'contact.html',     label: 'Contact' }
  ];
  document.getElementById('nav-logo').innerHTML = SITE_LOGO_SVG;
  document.getElementById('nav-links').innerHTML = navLinks.map(l => `
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
