/* =====================================================
   MANIFESTO MATCH — Scotland 2026
   Shared JS: data loading, helpers, nav, footer

   DATA PIPELINE
   ─────────────
   Each party has one "best source" JSON file in parties/.
   The file's analysis_source field tells us the source:
     "manifesto"                   → published manifesto  ✓
     "website_structured"          → party website (estimated)
     "website_campaign_mix"        → website + campaign (estimated)
     "social_proxy_plus_..."       → social/campaign (estimated)

   Loading order per party:
     1. parties/{id}.json  (best source — manifesto if available, else website)
     2. Inline fallback data below (if fetch fails, e.g. local testing)
   ===================================================== */

/* ── PARTY CONFIG ──────────────────────────────────────
   Maps internal IDs to file names and display info.
   Add Scottish Greens as 6th party.
   ─────────────────────────────────────────────────── */
const PARTY_CONFIG = [
  {
    id:     'lab',
    file:   'parties/scottish-labour.json',
    short:  'Labour',
    colour: { bg: '#E4003B', fg: '#FFFFFF', border: '#B80030' }
  },
  {
    id:     'snp',
    file:   'parties/snp.json',
    short:  'SNP',
    colour: { bg: '#FFF060', fg: '#000000', border: '#CCBB00' }
  },
  {
    id:     'con',
    file:   'parties/scottish-conservatives.json',
    short:  'Con',
    colour: { bg: '#003087', fg: '#FFFFFF', border: '#001E5E' }
  },
  {
    id:     'ld',
    file:   'parties/scottish-liberal-democrats.json',
    short:  'LD',
    colour: { bg: '#FAA61A', fg: '#FFFFFF', border: '#D88500' }
  },
  {
    id:     'ref',
    file:   'parties/reform-uk-scotland.json',
    short:  'Reform',
    colour: { bg: '#12B6DF', fg: '#FFFFFF', border: '#0994BA' }
  },
  {
    id:     'grn',
    file:   'parties/scottish-greens.json',
    short:  'Greens',
    colour: { bg: '#00B140', fg: '#FFFFFF', border: '#008A30' }
  }
];

/* ── TOPIC SCORES — derived from priorities data ───────
   Each party's topicScores are derived from:
   a) The priorities array (what they emphasise and how)
   b) Known policy positions for topics not covered

   Scale: 5=strongly champions, 4=supportive,
          3=neutral/not mentioned, 2=mild opposition,
          1=strongly opposed

   NOTE on directionality: scores reflect the party's
   position on the topic as framed by the question labels.
   e.g. "tax" score 5 = supports higher tax & spend.
   ─────────────────────────────────────────────────── */
const DERIVED_SCORES = {
  lab: {
    // Source: scottish-labour.json (website_structured, medium_high confidence)
    // Priorities: Health(1), Cost of Living(2), Law & Order(3), Housing(4), Education(6)
    independence: 1,  // Strongly opposed — core unionist position
    nhs:          5,  // Rank 1 priority — "Reduce waiting times, improve GP access"
    education:    4,  // Rank 6 — "Improve education standards"
    climate:      4,  // Known policy — net zero commitment
    economy:      4,  // Rank 2 — "Support households and economic growth"
    housing:      4,  // Rank 4 — "Increase housing supply"
    costliving:   5,  // Rank 2 — explicit priority
    transport:    4,  // Known policy — public transport investment
    socialcare:   5,  // Known flagship — free personal care extension
    drugs:        4,  // Known — drug deaths reform
    landreform:   4,  // Known — community land ownership
    policing:     4,  // Rank 3 — "Increase policing and community safety"
    energy:       3,  // Neutral — supports transition but not flagship
    equality:     4,  // Known — equality legislation support
    rural:        3,  // Moderate — some rural support
    immigration:  3,  // Neutral/managed approach
    tax:          4   // Known — higher tax & spend (income tax policy)
  },

  snp: {
    // Source: snp.json (website_campaign_mix, medium confidence)
    // Priorities: Independence(1,24%), Health(2,20%), Cost of Living(3), Families(4), Energy(5), Housing(6)
    independence: 5,  // Rank 1 (24%) — defining issue "second vote delivers independence"
    nhs:          4,  // Rank 2 (20%) — "GP walk-in clinics, shorter waits"
    education:    4,  // Rank 4 — families/childcare, curriculum commitments
    climate:      4,  // Rank 5 — "pro-renewables"
    economy:      3,  // Rank 3 — cost of living framing but moderate positioning
    housing:      3,  // Rank 6 — present but not top signal
    costliving:   4,  // Rank 3 (16%) — explicit "help with cost of living" policy commitment
    transport:    3,  // Known — moderate, some transport investment
    socialcare:   4,  // Rank 4 — families/childcare
    drugs:        4,  // Known — drug deaths emergency response
    landreform:   3,  // Known — some reform but not flagship
    policing:     3,  // Neutral — community justice focus
    energy:       4,  // Rank 5 — pro-renewables, energy bills
    equality:     4,  // Known — gender recognition, equality laws
    rural:        3,  // Moderate — rural policy present
    immigration:  4,  // Known — more open immigration policy
    tax:          3   // Known — moderate income tax adjustments
  },

  con: {
    // Source: scottish-conservatives.json (website_campaign_mix, medium confidence)
    // Priorities: Cost of Living/Lower Taxes(1,26%), Union(2,22%), Economy(3,16%), Health(4,14%), Education(5,12%), Justice(6,10%)
    independence: 1,  // Rank 2 (22%) — "Stop another independence referendum"
    nhs:          3,  // Rank 4 — "Improve NHS performance" but not a transformative commitment
    education:    3,  // Rank 5 — "Raise school standards"
    climate:      2,  // Known — sceptical of net zero targets
    economy:      2,  // Pro-market/lower-tax → scores LOW on state-led scale (corrected from 4)
    housing:      2,  // Known — market-led, limited intervention
    costliving:   3,  // Rank 1 — "bring down bills" but via lower taxes not spending
    transport:    2,  // Known — reduce subsidy
    socialcare:   3,  // Neutral — some reform commitments
    drugs:        2,  // Known — tougher enforcement approach
    landreform:   2,  // Known — protect existing ownership rights
    policing:     4,  // Rank 6 — "Common-sense order, stronger justice"
    energy:       4,  // Known — supports oil & gas and nuclear
    equality:     2,  // Known — rolled back some equality legislation
    rural:        4,  // Known — farming and rural support
    immigration:  2,  // Known — stricter controls
    tax:          2   // Rank 1 — "lower taxes" = score 2 (low on our higher-tax scale)
  },

  ld: {
    // Source: scottish-liberal-democrats.json (social_proxy_plus_campaign_page, medium confidence)
    // Priorities: Health/Social Care(1,28%), Fairness(2,20%), Transport/Ferries(3,16%), Education(4,14%)
    independence: 2,  // Known — oppose independence, would consider federalism
    nhs:          5,  // Rank 1 (28%) — "Fix social care, improve NHS access"
    education:    4,  // Rank 4 (14%) — "Improve standards and opportunity"
    climate:      4,  // Known — strong climate commitments
    economy:      3,  // Rank 6 — present but moderate
    housing:      3,  // Known — some housing commitments
    costliving:   4,  // Rank 2 (20%) — "Change with fairness at its heart"
    transport:    5,  // Rank 3 (16%) — "Fix ferries and transport failures" — very prominent
    socialcare:   4,  // Rank 1 (28%) — social care included in top priority
    drugs:        4,  // Known — supports harm reduction
    landreform:   3,  // Known — some reform
    policing:     3,  // Neutral
    energy:       4,  // Known — strong renewables support
    equality:     4,  // Known — equality legislation support
    rural:        3,  // Known — rural connectivity, ferries
    immigration:  3,  // Known — managed/open approach
    tax:          3   // Known — balanced approach
  },

  ref: {
    // Source: reform-uk-scotland.json (MANIFESTO, high confidence)
    // Priorities: Health/Welfare(1,16.1%), Economy/Tax(2,15.3%), Housing(3,15.1%),
    //             Education(4,13.5%), Rural(5,8.6%), Energy(6,7.9%), Justice(7,7.3%), Constitution(8,6.3%)
    independence: 1,  // Rank 8 — "Oppose independence; reform Holyrood"
    nhs:          4,  // Rank 1 (16.1%) — "Reform NHS" (supportive but reform-focused)
    education:    3,  // Rank 4 (13.5%) — "Reform education, expand skills training"
    climate:      1,  // Rank 6 — "Oppose current Net Zero approach"
    economy:      1,  // Rank 2 (15.3%) — "Lower taxes, pro-growth" → strongly market-led = score 1 on state-led scale
    housing:      4,  // Rank 3 (15.1%) — "Increase housing supply"
    costliving:   4,  // Linked to Economy rank 2
    transport:    3,  // Rank 10 — lower priority
    socialcare:   4,  // Rank 1 (16.1%) — health & social care flagship
    drugs:        1,  // Known — tougher enforcement
    landreform:   1,  // Known — protect property rights
    policing:     5,  // Rank 7 — "Increase enforcement and policing"
    energy:       2,  // Rank 6 — "Pro oil and gas; oppose Net Zero"
    equality:     1,  // Known — opposed to current equality agenda
    rural:        4,  // Rank 5 (8.6%) — "Support rural industries"
    immigration:  1,  // Known — strict border controls
    tax:          1   // Rank 2 — "Lower taxes" = score 1 on our higher-tax-spend scale
  },

  grn: {
    // Source: scottish-greens.json (campaign_website_mix, medium confidence)
    // Priorities: Climate/Energy(1,24%), Cost of Living/Fairness(2,18%), Transport(3,16%),
    //             Families/Childcare(4,14%), Land/Housing(5,14%), Independence/Democracy(6,14%)
    independence: 4,  // Rank 6 (14%) — "Independent and greener Scotland"
    nhs:          5,  // Known — strong NHS investment position
    education:    4,  // Rank 4 — families/childcare
    climate:      5,  // Rank 1 (24%) — defining issue "climate-led politics"
    economy:      3,  // Rank 2 — fairness framing, not growth-led
    housing:      5,  // Rank 5 (14%) — "Land reform and community control"
    costliving:   4,  // Rank 2 (18%) — "Protect households, public services"
    transport:    5,  // Rank 3 (16%) — "Expand public transport, free bus travel"
    socialcare:   4,  // Rank 4 — families and childcare
    drugs:        5,  // Known flagship — decriminalisation
    landreform:   5,  // Rank 5 — signature issue "land back to the people"
    policing:     3,  // Neutral — justice reform focus
    energy:       5,  // Rank 1 (24%) — renewables, just transition
    equality:     5,  // Known — strong equality commitments
    rural:        3,  // Moderate — rural communities
    immigration:  4,  // Known — more open policy
    tax:          4   // Known — higher tax & spend, wealth taxes
  }
};

/* ── WEBSITE SCORES — from party websites & campaign materials ─
   These represent each party's emphasis based on their public
   website and campaign materials, regardless of whether a
   manifesto has been published.

   Used for two purposes:
   1. Primary matching source when no manifesto exists
   2. Discrepancy comparison — if a party has a manifesto and
      a topic score differs from their website emphasis, the
      results page flags this to the user.

   A difference of ≥2 on any topic is treated as a meaningful
   discrepancy worth noting.
   ─────────────────────────────────────────────────────────── */
const WEBSITE_SCORES = {
  lab: {
    // Same as DERIVED_SCORES — no manifesto yet, website IS the source
    independence:1, nhs:5, education:4, climate:4, economy:4, housing:4,
    costliving:5, transport:4, socialcare:5, drugs:4, landreform:4,
    policing:4, energy:3, equality:4, rural:3, immigration:3, tax:4
  },
  snp: {
    // Same as DERIVED_SCORES — no manifesto yet, website IS the source
    independence:5, nhs:4, education:4, climate:4, economy:3, housing:3,
    costliving:4, transport:3, socialcare:4, drugs:4, landreform:3,
    policing:3, energy:4, equality:4, rural:3, immigration:4, tax:3
  },
  con: {
    // Same as DERIVED_SCORES — no manifesto yet, website IS the source
    independence:1, nhs:3, education:3, climate:2, economy:2, housing:2,
    costliving:3, transport:2, socialcare:3, drugs:2, landreform:2,
    policing:4, energy:4, equality:2, rural:4, immigration:2, tax:2
  },
  ld: {
    // Same as DERIVED_SCORES — no manifesto yet, website IS the source
    independence:2, nhs:5, education:4, climate:4, economy:3, housing:3,
    costliving:4, transport:5, socialcare:4, drugs:4, landreform:3,
    policing:3, energy:4, equality:4, rural:3, immigration:3, tax:3
  },
  ref: {
    // Reform WEBSITE/CAMPAIGN emphasis — differs from the published manifesto.
    // The campaign website highlights policing, immigration and lower taxes
    // but does NOT reflect the manifesto's detailed NHS/housing commitments.
    independence:1, nhs:3, education:2, climate:1, economy:3, housing:2,
    costliving:3, transport:2, socialcare:2, drugs:1, landreform:1,
    policing:5, energy:2, equality:1, rural:3, immigration:1, tax:1
    // Key differences vs manifesto (DERIVED_SCORES):
    //   nhs:      3 vs 4  (manifesto more committed)
    //   education:2 vs 3  (manifesto more committed)
    //   economy:  3 vs 1  (website less extreme on market positioning)
    //   housing:  2 vs 4  (manifesto explicitly commits to supply increase)
    //   costliving:3 vs 4 (manifesto more prominent)
    //   socialcare:2 vs 4 (manifesto flagship; website underplays it)
    //   transport:2 vs 3  (minor difference)
    //   rural:    3 vs 4  (manifesto explicitly commits to rural industries)
  },
  grn: {
    // Same as DERIVED_SCORES — no manifesto yet, website IS the source
    independence:4, nhs:5, education:4, climate:5, economy:3, housing:5,
    costliving:4, transport:5, socialcare:4, drugs:5, landreform:5,
    policing:3, energy:5, equality:5, rural:3, immigration:4, tax:4
  }
};
const INLINE_TOPICS = [
  { id:'independence', name:'Scottish Independence',   icon:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc:'Scotland becoming an independent country',              questionLabels:{support:'Yes to independence',  neutral:'Undecided',           oppose:'No to independence'} },
  { id:'nhs',          name:'NHS & Healthcare',         icon:'🏥', desc:'NHS investment, waiting times, mental health services', questionLabels:{support:'Increase investment',   neutral:'Keep as is',          oppose:'Reduce / reform'} },
  { id:'education',    name:'Education',                icon:'🎓', desc:'Schools, free university tuition, curriculum reform',  questionLabels:{support:'Increase investment',   neutral:'Keep as is',          oppose:'Reduce / reform'} },
  { id:'climate',      name:'Climate & Environment',    icon:'🌍', desc:'Net zero targets, renewables, environmental protection',questionLabels:{support:'Prioritise action',      neutral:'Balanced approach',   oppose:'Deprioritise'} },
  { id:'economy',      name:'Economy & Jobs',           icon:'💼', desc:'Growth, employment, business support, wages',          questionLabels:{support:'State-led growth',       neutral:'Balanced approach',   oppose:'Market-led growth'} },
  { id:'housing',      name:'Housing & Homelessness',   icon:'🏠', desc:'Affordable housing, rent controls, social housing',    questionLabels:{support:'More social housing',    neutral:'Balanced approach',   oppose:'Market-led supply'} },
  { id:'costliving',   name:'Cost of Living',           icon:'🛒', desc:'Household bills, benefits, tackling rising prices',    questionLabels:{support:'More government support',neutral:'Targeted support',    oppose:'Reduce intervention'} },
  { id:'transport',    name:'Public Transport',         icon:'🚆', desc:'Rail, buses, active travel, rural connectivity',       questionLabels:{support:'Expand & invest',        neutral:'Keep as is',          oppose:'Reduce subsidy'} },
  { id:'socialcare',   name:'Social Care',              icon:'👴', desc:'Elderly care, disability support, carers',             questionLabels:{support:'Increase investment',   neutral:'Keep as is',          oppose:'Reform / reduce'} },
  { id:'drugs',        name:'Drug Policy Reform',       icon:'💊', desc:'Tackling drug deaths, treatment, harm reduction',      questionLabels:{support:'Decriminalise / treat', neutral:'Current approach',    oppose:'Tougher enforcement'} },
  { id:'landreform',   name:'Land Reform',              icon:'🌾', desc:'Community land ownership, diversifying ownership',     questionLabels:{support:'More reform',           neutral:'Some reform',         oppose:'Protect current ownership'} },
  { id:'policing',     name:'Policing & Justice',       icon:'⚖️', desc:'Police Scotland, criminal justice, community safety',  questionLabels:{support:'More police & powers',  neutral:'Current approach',    oppose:'Reform-focused'} },
  { id:'energy',       name:'Energy Policy',            icon:'⚡', desc:'Renewables, oil & gas transition, energy costs',       questionLabels:{support:'Renewables-first',       neutral:'Balanced transition', oppose:'Support oil & gas'} },
  { id:'equality',     name:'Equality & Rights',        icon:'🏳️‍🌈', desc:'LGBTQ+ rights, gender equality, disability rights',   questionLabels:{support:'Strengthen protections',neutral:'Current approach',    oppose:'Roll back'} },
  { id:'rural',        name:'Rural Affairs & Farming',  icon:'🐄', desc:'Agricultural support, rural communities, fishing',     questionLabels:{support:'More rural support',     neutral:'Keep as is',          oppose:'Reduce subsidies'} },
  { id:'immigration',  name:'Immigration & Borders',    icon:'🛂', desc:'Immigration policy, asylum seekers, border control',   questionLabels:{support:'More open policy',       neutral:'Managed approach',    oppose:'Stricter controls'} },
  { id:'tax',          name:'Tax & Public Spending',    icon:'💰', desc:'Income tax rates, council tax, public spending levels', questionLabels:{support:'Higher tax & spend',     neutral:'Balanced approach',   oppose:'Lower tax & spend'} }
];

/* ── RUNTIME STATE ─────────────────────────────────── */
let PARTIES = [];
let TOPICS  = [];
let _dataPromise = null;

/* ── SOURCE LABEL ──────────────────────────────────── */
function sourceLabel(analysisSource) {
  if (!analysisSource) return { isManifesto: false, label: 'estimated' };
  const src = analysisSource.toLowerCase();
  if (src === 'manifesto') return { isManifesto: true,  label: 'manifesto' };
  if (src.includes('website_structured'))  return { isManifesto: false, label: 'website' };
  return { isManifesto: false, label: 'website' };
}

/* ── CONVERT BEST-SOURCE FILE → INTERNAL PARTY ─────── */
function convertPartyFile(raw, config) {
  const { isManifesto } = sourceLabel(raw.analysis_source);
  const p = raw.party || {};

  // Find manifesto URL if source is manifesto
  const manifestoUrl = isManifesto && raw.sources && raw.sources.length
    ? (raw.sources.find(s => s.url) || {}).url || null
    : null;

  return {
    id:             config.id,
    name:           p.party_name  || config.id,
    short:          config.short,
    leader:         p.party_leader || '',
    web:            p.party_website || '',
    manifestoStatus: isManifesto ? 'published' : 'pending',
    manifestoUrl:   manifestoUrl,
    estimated:      !isManifesto,
    colour:         config.colour,
    // Use pre-derived scores (mapped from priorities + known positions)
    topicScores:    DERIVED_SCORES[config.id] || {},
    // Website scores for discrepancy comparison in results
    websiteScores:  WEBSITE_SCORES[config.id] || {}
  };
}

/* ── DATA LOADING ──────────────────────────────────── */
async function loadData() {
  if (_dataPromise) return _dataPromise;
  _dataPromise = (async () => {

    // Always use inline topics (stable definitions, not party-dependent)
    TOPICS = INLINE_TOPICS;

    try {
      // Fetch all party best-source files in parallel
      const results = await Promise.all(
        PARTY_CONFIG.map(async (config) => {
          try {
            const res = await fetch(config.file);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.json();
            return convertPartyFile(raw, config);
          } catch (e) {
            console.warn(`Could not load ${config.file} — using inline fallback for ${config.id}`);
            return null;
          }
        })
      );

      // Use loaded data where available, build inline fallback for any that failed
      PARTIES = results.map((p, i) => {
        if (p) return p;
        const config = PARTY_CONFIG[i];
        return {
          id:             config.id,
          name:           config.id,
          short:          config.short,
          leader:         '',
          web:            '',
          manifestoStatus: 'pending',
          manifestoUrl:   null,
          estimated:      true,
          colour:         config.colour,
          topicScores:    DERIVED_SCORES[config.id] || {},
          websiteScores:  WEBSITE_SCORES[config.id] || {}
        };
      });

      console.info('Scot Vote Manifesto Matcher: loaded', PARTIES.filter(Boolean).length, 'parties');

    } catch (e) {
      // Total failure — build all parties from inline data
      console.warn('Scot Vote Manifesto Matcher: using fully inline data:', e.message);
      PARTIES = PARTY_CONFIG.map(config => ({
        id:             config.id,
        name:           config.id,
        short:          config.short,
        leader:         '',
        web:            '',
        manifestoStatus: 'pending',
        manifestoUrl:   null,
        estimated:      true,
        colour:         config.colour,
        topicScores:    DERIVED_SCORES[config.id] || {},
        websiteScores:  WEBSITE_SCORES[config.id] || {}
      }));
    }

    // Merge party scores into topics for quick lookup during scoring
    TOPICS.forEach(t => {
      t.partyScores = {};
      t.partyWebsiteScores = {};
      PARTIES.forEach(p => {
        const ms = p.topicScores   || {};
        const ws = p.websiteScores || {};
        t.partyScores[p.id]        = typeof ms[t.id] === 'number' ? ms[t.id] : 3;
        t.partyWebsiteScores[p.id] = typeof ws[t.id] === 'number' ? ws[t.id] : 3;
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
  const c  = p.colour || {};
  const sz = sm ? 28 : 36, r = sm ? 6 : 8, fs = sm ? 8 : 9.5;
  const lbl = p.short.length > 5 ? p.short.slice(0,5) : p.short;
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"
    xmlns="http://www.w3.org/2000/svg"
    style="flex-shrink:0;border-radius:${r}px;display:inline-block;vertical-align:middle">
    <rect width="${sz}" height="${sz}" rx="${r}"
      fill="${c.bg}" stroke="${c.border||'#ccc'}" stroke-width="1.2"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
      font-family="'DM Sans',system-ui,sans-serif" font-weight="800" font-size="${fs}"
      fill="${c.fg}" letter-spacing="-0.3">${lbl}</text>
  </svg>`;
}

/* ── NAV ───────────────────────────────────────────── */
function initNav(pageId) {
  const navLinks = [
    { id: 'home',        href: 'index.html',       label: 'Home' },
    { id: 'parties',     href: 'parties.html',     label: 'Parties' },
    { id: 'methodology', href: 'methodology.html', label: 'Methodology' },
    { id: 'about',       href: 'about.html',       label: 'About' },
    { id: 'contact',     href: 'contact.html',     label: 'Contact' }
  ];
  document.getElementById('nav-links').innerHTML = navLinks.map(l => `
    <li><a href="${l.href}" class="${l.id === pageId ? 'active' : ''}">${l.label}</a></li>
  `).join('');
}

/* ── FOOTER ────────────────────────────────────────── */
function initFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <p>Scot Vote Manifesto Matcher &nbsp;·&nbsp; Scottish Parliament Elections 2026 &nbsp;·&nbsp; Non-partisan voter information tool</p>
    <div class="footer-links">
      <a href="index.html">Home</a>
      <a href="parties.html">Parties</a>
      <a href="methodology.html">Methodology</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </div>
    <p style="margin-top:14px;font-size:.73rem">Not affiliated with any political party. Scores derived from published manifestos where available, otherwise from party websites and campaign materials.</p>`;
}
