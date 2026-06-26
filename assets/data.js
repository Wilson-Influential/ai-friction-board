/* ============================================================
   FRICTION — shared data layer
   One place for the seed list, categories, and saved state.
   Non-technical edit: change the SEED array below to add or
   reword the starter friction points. Votes and new entries
   are kept in the browser (localStorage) for this prototype.
   A shared team version would swap this file for a tiny
   database (Supabase) so everyone sees the same board.
   ============================================================ */

const FRICTION = (() => {
  const STORE_KEY = 'friction_v1';

  // Sector / type colours, pulled straight from the Influential palette.
  // Kept visually distinct from each other; text colour is picked
  // automatically (see textOn) so any colour stays legible.
  const CATEGORIES = {
    'Onboarding':   { color: '#efa33f', tag: 'Mustard Yellow' },
    'PR workflow':  { color: '#0b1ee4', tag: 'PR Blue' },
    'Design':       { color: '#fe2458', tag: 'Insights Red' },
    'Repetition':   { color: '#ff7d3a', tag: 'Campaign Orange' },
    'Reporting':    { color: '#197319', tag: 'Forest Green' },
    'Admin':        { color: '#5f616d', tag: 'Charcoal' },
    'Other':        { color: '#201747', tag: 'Navy' }
  };

  // Colour each pipeline stage gets, as a clean progression.
  const STATUS_COLORS = {
    'Raised':      '#5f616d',  // charcoal — just in
    'Shortlisted': '#0b1ee4',  // blue — under consideration
    'Building':    '#ff7d3a',  // orange — in progress
    'Shipped':     '#197319'   // green — done
  };

  // Pick black or white text for a given background, by luminance.
  // Lets the team add any brand colour without breaking readability.
  function textOn(hex){
    const c = hex.replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    const L = (0.299*r + 0.587*g + 0.114*b) / 255;
    return L > 0.62 ? '#1a1430' : '#ffffff';
  }

  const STATUSES = ['Raised', 'Shortlisted', 'Building', 'Shipped'];

  // Seeded from the 2026-06-26 directors meeting (Sarah's points + the
  // deck studio thread). These are illustrative starters, not a record
  // of anyone's complaint, so the board never opens empty.
  const SEED = [
    {
      id: 's1',
      title: 'Onboarding is stitched together by hand',
      detail: 'Around 30 separate forms and individually written emails to get a client live. Across the 93 Chester and Merseyside businesses that is hours of copy-paste that never reads quite the same twice.',
      category: 'Onboarding',
      who: 'Sarah',
      minsPerWeek: 240,
      frequency: 'Every new client',
      votes: 9,
      status: 'Shortlisted',
      aiIdea: 'One onboarding flow that fills the forms and drafts the emails from a single set of client answers.'
    },
    {
      id: 's2',
      title: 'PR time is logged in a fiddly spreadsheet',
      detail: 'Allocating hours across clients means wrestling a spreadsheet that fights back. Easy to mis-key, hard to see at a glance where the week actually went.',
      category: 'PR workflow',
      who: 'Sarah',
      minsPerWeek: 90,
      frequency: 'Weekly',
      votes: 7,
      status: 'Raised',
      aiIdea: 'A simple time view that totals and sanity-checks itself, so logging takes seconds.'
    },
    {
      id: 's3',
      title: 'Every small deck tweak waits on a designer',
      detail: 'A logo swap or a one-line change on a PowerPoint still needs Connor. Fine for big creative, frustrating for tiny brand-safe edits.',
      category: 'Design',
      who: 'From the deck studio thread',
      minsPerWeek: 120,
      frequency: 'Most weeks',
      votes: 8,
      status: 'Building',
      aiIdea: 'The deck / Post studio: brand-safe edits anyone can make, designers freed for the real work. Already in progress.'
    },
    {
      id: 's4',
      title: 'Re-typing the brand rules into every AI tool',
      detail: 'Same colours, same fonts, same do-nots, typed out again every time. The tool should already know the brand.',
      category: 'Repetition',
      who: 'Shea',
      minsPerWeek: 45,
      frequency: 'Daily',
      votes: 5,
      status: 'Building',
      aiIdea: 'A brand brain the tools read from, so nobody describes the brand by hand again.'
    },
    {
      id: 's5',
      title: 'Chasing sign-off and the latest version',
      detail: 'Which file is final? Who still needs to approve? Threads, reply-alls, and the odd v7_FINAL_final.',
      category: 'Admin',
      who: 'Open',
      minsPerWeek: 60,
      frequency: 'Most projects',
      votes: 4,
      status: 'Raised',
      aiIdea: 'One link per piece that shows the live version and who is left to approve.'
    },
    {
      id: 's6',
      title: 'Monthly reports rebuilt from scratch',
      detail: 'Pulling the same numbers into the same layout every month. Different client, same hour lost.',
      category: 'Reporting',
      who: 'Open',
      minsPerWeek: 75,
      frequency: 'Monthly',
      votes: 3,
      status: 'Raised',
      aiIdea: 'A report that fills its own template from the month\'s data.'
    }
  ];

  const DEL_KEY = 'friction_deleted_v1';
  function loadDeleted() {
    try { return new Set(JSON.parse(localStorage.getItem(DEL_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }

  function load() {
    const del = loadDeleted();
    let list;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      // Merge: keep seed items current, append anything the user added.
      const seedById = Object.fromEntries(structuredClone(SEED).map(s => [s.id, s]));
      if (raw) { for (const item of JSON.parse(raw)) seedById[item.id] = item; }
      list = Object.values(seedById);
    } catch (e) {
      list = structuredClone(SEED);
    }
    // Honour deletions (works for seeded items too, so they don't reappear).
    return list.filter(x => !del.has(x.id));
  }

  // Mark an item deleted so it stays gone across reloads.
  function remove(id) {
    const d = loadDeleted(); d.add(id);
    try { localStorage.setItem(DEL_KEY, JSON.stringify([...d])); } catch (e) {}
  }

  // Reverse a delete (for Undo).
  function undelete(id) {
    const d = loadDeleted(); d.delete(id);
    try { localStorage.setItem(DEL_KEY, JSON.stringify([...d])); } catch (e) {}
  }

  function save(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  // Opportunity score = how much this drags x how many people feel it.
  // Time lost per week (capped so one big number can't dominate) times a
  // gentle curve on votes. Keeps "lots of people, real time" at the top.
  function score(item) {
    const timeWeight = Math.min(item.minsPerWeek || 0, 300) / 30;      // 0–10
    const voteWeight = Math.sqrt(Math.max(item.votes, 0));             // gentle
    return Math.round((timeWeight * 4 + voteWeight * 6) * 10) / 10;
  }

  function newId() { return 'u' + Date.now().toString(36); }

  return { CATEGORIES, STATUS_COLORS, STATUSES, SEED, load, save, remove, undelete, score, newId, textOn, STORE_KEY };
})();
