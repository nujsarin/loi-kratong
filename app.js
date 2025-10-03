/* Loi Krathong Front-end (local first, optional Firebase sync)
 * Author: ChatGPT
 * Notes:
 * - Local mode: floats only on your screen.
 * - Realtime mode: paste Firebase config (Firestore) and click Connect.
 */

const BASES = [
  { id:'bread',       label:'ขนมปัง',        colors:['#e6d6a4','#bca86b'] },
  { id:'banana',      label:'หยวกกล้วย',     colors:['#7fc970','#2a7a3a'] },
  { id:'bananaLeaf',  label:'ใบตอง',         colors:['#6dcf7f','#2d8a3f'] },
  { id:'lotusLeaf',   label:'ใบบัว',         colors:['#9fd6c2','#457b6b'] },
  { id:'ecoFoam',     label:'วัสดุธรรมชาติ', colors:['#d2cbb2','#8a7d5a'] }
];

const FLOWERS = [
  { id:'marigold', label:'ดาวเรือง', color:'#F5C518' },
  { id:'orchid',   label:'กล้วยไม้', color:'#B968C7' },
  { id:'rose',     label:'กุหลาบ',   color:'#E14D5B' },
  { id:'lotus',    label:'บัว',      color:'#9ad1d4' },
  { id:'jasmine',  label:'มะลิ',     color:'#ffffff' }
];

let state = {
  base: BASES[0].id,
  flowers: new Set(),
  candles: 1,
  wish: ""
};

// UI hookup
const baseOptions = document.getElementById('baseOptions');
const flowerOptions = document.getElementById('flowerOptions');
const candleRange = document.getElementById('candleCount');
const candleLabel = document.getElementById('candleLabel');
const wishInput = document.getElementById('wish');
const previewBtn = document.getElementById('previewBtn');
const floatBtn = document.getElementById('floatBtn');
const river = document.getElementById('river');
const clearLocalBtn = document.getElementById('clearLocalBtn');
const firebaseConfigEl = document.getElementById('firebaseConfig');
const connectFirebaseBtn = document.getElementById('connectFirebaseBtn');
const statusEl = document.getElementById('status');

// Render base options
BASES.forEach(b => {
  const btn = document.createElement('button');
  btn.textContent = b.label;
  btn.dataset.id = b.id;
  btn.addEventListener('click', () => {
    state.base = b.id;
    [...baseOptions.children].forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
  });
  if(b.id === state.base) btn.classList.add('selected');
  baseOptions.appendChild(btn);
});

// Render flower options (multi-select)
FLOWERS.forEach(f => {
  const btn = document.createElement('button');
  btn.textContent = f.label;
  btn.dataset.id = f.id;
  btn.addEventListener('click', () => {
    if(state.flowers.has(f.id)) {
      state.flowers.delete(f.id);
      btn.classList.remove('selected');
    } else {
      if(state.flowers.size >= 5) {
        alert('เลือกได้สูงสุด 5 ดอก');
        return;
      }
      state.flowers.add(f.id);
      btn.classList.add('selected');
    }
  });
  flowerOptions.appendChild(btn);
});

candleRange.addEventListener('input', () => {
  state.candles = +candleRange.value;
  candleLabel.textContent = state.candles;
});

wishInput.addEventListener('input', () => {
  state.wish = wishInput.value.trim();
});

previewBtn.addEventListener('click', () => {
  spawnKrathong(buildPayload(false));
});

floatBtn.addEventListener('click', async () => {
  const payload = buildPayload(true);
  spawnKrathong(payload);
  // Push to Firestore if connected
  if(window.db) {
    try {
      await window.db.collection('krathongs').add(payload);
    } catch(e) {
      console.error(e);
    }
  }
});

clearLocalBtn.addEventListener('click', () => {
  river.querySelectorAll('.krathong').forEach(el=>el.remove());
});

function buildPayload(isSend){
  const base = BASES.find(b=>b.id===state.base);
  const flowers = [...state.flowers];
  const candles = state.candles;
  const wish = state.wish || '';
  const createdAt = Date.now();
  return { base: base.id, baseColors: base.colors, flowers, candles, wish, createdAt, isSend };
}

// Create a DOM krathong and animate
function spawnKrathong(data){
  const tpl = document.getElementById('krathongTemplate');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = String(data.createdAt);
  // randomize track
  const y = (Math.random() * 40 - 10).toFixed(1) + 'vh'; // vertical offset
  const z = (Math.random() * -600).toFixed(0) + 'px';    // perspective depth (negative = far)
  const s = (0.6 + Math.random()*0.8).toFixed(2);        // scale
  const r = (Math.random()*6 - 3).toFixed(2) + 'deg';    // slight tilt
  const xStart = '120vw';

  node.style.setProperty('--y', y);
  node.style.setProperty('--z', z);
  node.style.setProperty('--s', s);
  node.style.setProperty('--r', r);
  node.style.setProperty('--xStart', xStart);

  // base
  const base = node.querySelector('.base');
  base.style.setProperty('--baseA', data.baseColors[0]);
  base.style.setProperty('--baseB', data.baseColors[1]);

  // flowers placement (up to 5)
  const flowerWrap = node.querySelector('.decor.flowers');
  data.flowers.forEach((fid, idx) => {
    const fdef = FLOWERS.find(f=>f.id===fid);
    if(!fdef) return;
    const f = document.createElement('div');
    f.className = 'flower';
    f.style.setProperty('--color', fdef.color);
    // place around ellipse
    const angle = (idx / Math.max(1,data.flowers.length)) * Math.PI * 2;
    const rx = 70, ry = 18;
    const cx = 90, cy = 22;
    f.style.left = (cx + Math.cos(angle)*rx) + 'px';
    f.style.top  = (cy + Math.sin(angle)*ry) + 'px';
    flowerWrap.appendChild(f);
  });

  // candles (center row)
  const candleWrap = node.querySelector('.decor.candles');
  const count = Math.min(9, Math.max(0, data.candles));
  const spacing = 14;
  const startX = 90 - ((count-1)*spacing)/2;
  for(let i=0;i<count;i++){
    const c = document.createElement('div'); c.className='candle';
    c.style.left = (startX + i*spacing) + 'px';
    c.style.top  = '5px';
    candleWrap.appendChild(c);
    const flame = document.createElement('div'); flame.className='flame';
    flame.style.left = (startX + i*spacing) + 'px';
    flame.style.top  = '2px';
    candleWrap.appendChild(flame);
  }

  // wish
  node.querySelector('.wish').textContent = data.wish;

  // duration 10–15s
  const dur = 10 + Math.random()*5;
  node.style.animation = `floatLeft ${dur}s linear forwards`;

  river.appendChild(node);

  // remove after finish to avoid DOM bloat
  setTimeout(()=> node.remove(), (dur+0.5)*1000);
}

/* ---------- Optional Firebase realtime ---------- */
let unsub = null;
connectFirebaseBtn?.addEventListener('click', async () => {
  try {
    const cfg = JSON.parse(firebaseConfigEl.value.trim());
    if(!cfg.projectId) throw new Error('missing projectId');
    // eslint-disable-next-line no-undef
    const app = firebase.initializeApp(cfg);
    // eslint-disable-next-line no-undef
    window.db = firebase.firestore();
    statusEl.textContent = 'Realtime: connected';
    statusEl.style.color = '#f7d25b';

    // basic listener (last 100, newest first)
    unsub?.();
    unsub = window.db.collection('krathongs')
      .orderBy('createdAt','desc')
      .limit(100)
      .onSnapshot(snap => {
        snap.docChanges().forEach(ch => {
          if(ch.type === 'added'){
            const data = ch.doc.data();
            spawnKrathong(data);
          }
        });
      });
  } catch(e) {
    console.error(e);
    alert('Config ไม่ถูกต้อง หรือเชื่อมต่อไม่ได้');
  }
});

// Welcome demo floats to showcase the scene
setTimeout(()=>{
  const demo = [
    {base:'banana', baseColors:['#7fc970','#2a7a3a'], flowers:['marigold','rose'], candles:3, wish:'สุขภาพดี มีความสุข', createdAt:Date.now()},
    {base:'bread', baseColors:['#e6d6a4','#bca86b'], flowers:['lotus','jasmine'], candles:1, wish:'โชคดีปีใหม่', createdAt:Date.now()+1}
  ];
  demo.forEach(d=>spawnKrathong(d));
}, 600);
