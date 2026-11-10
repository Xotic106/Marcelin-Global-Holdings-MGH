/* =========================================================
   Island Essence DMC · A Living Creole Experience
   3D map tour engine — no dependencies.

   Map coordinates are in "board units" (the board is 1000 × 1200).
   Positions are illustrative, not GPS-accurate.
   ========================================================= */
(() => {
  'use strict';

  // ---------------------------------------------------------------- content
  const IMG = 'assets/img/';

  const STOPS = [
    {
      id: 'hotel', badge: 'H', short: 'Pick-up', label: 'Hotel pick-up',
      x: 380, y: 215, zoom: 1.7, rz: -10,
      time: '8:00 – 8:30 a.m.', view: 'welcome',
    },
    {
      id: 'market', badge: '1', short: 'Victoria Market', label: 'Victoria Market',
      x: 555, y: 300, zoom: 2.7, rz: -4,
      time: '9:00 – 9:45 a.m.', place: 'Victoria, Mahé',
      text: 'Start in the heart of the capital. Victoria’s market is where Seychellois come for fresh fish, fruit, vegetables and spices — a front-row seat to everyday Creole life.',
      discover: [
        'Fresh produce, fish and spices used in traditional cooking',
        'How fishing and local ingredients shape a Creole meal',
        'Why fish, rice, spices and coconut milk sit at the heart of Seychellois cuisine',
      ],
      photos: [
        { src: 'victoria-market.jpg', cap: 'Fresh produce at the market' },
        { src: 'victoria-streets.jpg', cap: 'Everyday life in Victoria' },
      ],
      tip: 'The historic market building has been under renovation, so your guide will confirm the exact market location on the day.',
    },
    {
      id: 'museum', badge: '2', short: 'National Museum', label: 'National Museum of History',
      x: 542, y: 322, zoom: 2.7, rz: 4,
      time: '10:00 – 11:00 a.m.', place: 'Independence Avenue, Victoria',
      text: 'The National Museum of History tells the story of Seychelles — from early discovery and the colonial period to nationhood and the Creole culture you’ll meet all day.',
      discover: [
        'Galleries on early discovery, the colonial period and nationhood',
        'The Creole Culture gallery and traditional island life',
        'African, European and other influences on language, food, music, dance and architecture',
      ],
      quote: 'As we explore the exhibits, I invite you to think about how traditions are passed from one generation to another. Which object or tradition do you think best represents the culture of a country?',
      photos: [
        { src: 'museum-exterior.jpg', cap: 'National Museum of History' },
        { src: 'museum-creole-gallery.jpg', cap: 'Inside the Creole Culture gallery' },
      ],
    },
    {
      id: 'venn', badge: '3', short: 'Mission Lodge', label: 'Venn’s Town – Mission Lodge',
      x: 420, y: 345, zoom: 2.3, rz: 8,
      time: '11:45 a.m. – 12:15 p.m.', place: 'Sans Souci · Morne Seychellois',
      text: 'High in the forested hills above Victoria, the Mission Ruins mark the school that missionaries founded for the children of liberated Africans who arrived in Seychelles after 1861.',
      discover: [
        'The story of the mission school and the liberated African children who studied here',
        'A quiet moment of reflection on education, freedom and heritage',
        'The lush mountain landscape that surrounds the ruins',
      ],
      photos: [
        { src: 'vennstown-entrance.jpg', cap: 'Welcome to Venn’s Town' },
        { src: 'vennstown-ruins.jpg', cap: 'Stone walls of the mission school' },
      ],
    },
    {
      id: 'marengo', badge: '4', short: 'Creole lunch', label: 'Creole lunch · Maison Marengo',
      x: 645, y: 660, zoom: 2.9, rz: -10,
      time: '1:00 – 2:00 p.m.', place: 'Maison Marengo · Domaine de Val des Prés, Au Cap',
      text: 'Time to taste everything you saw at the market this morning. Lunch is a pre-arranged Creole meal, served with stories about local ingredients and cooking traditions.',
      menu: true,
      photos: [
        { src: 'lunch-menu.jpg', cap: 'Today’s menu card · tap to enlarge', top: true },
        { src: 'maison-marengo.jpg', cap: 'Maison Marengo' },
      ],
      tip: 'Please tell us about any dietary requirements before your tour — the menu is confirmed with Maison Marengo in advance.',
    },
    {
      id: 'craft', badge: '5', short: 'Craft Village', label: 'Domaine de Val des Prés',
      x: 636, y: 677, zoom: 3.0, rz: -4,
      time: '2:00 – 3:00 p.m.', place: 'Craft Village · Au Cap, Mahé',
      text: 'Wander through Gran Kaz, a historic plantation house, and the craft village around it — where local artisans turn coconut shell, natural fibres and wood into practical and beautiful things.',
      discover: [
        'How traditional houses were designed for the tropical climate',
        'Crafts made from coconut shell, fibres, wood and other local materials',
        'An artisan demonstration when arranged — and a chance to support local makers',
      ],
      quote: 'Look at the building materials, the layout of the house and the way the design responds to the tropical climate.',
      photos: [
        { src: 'valdespres-grankaz.jpg', cap: 'Traditional Creole architecture' },
        { src: 'valdespres-veranda.jpg', cap: 'Inside a traditional island home' },
      ],
    },
    {
      id: 'moutya', badge: '6', short: 'Moutya', label: 'Moutya cultural experience',
      x: 653, y: 692, zoom: 3.0, rz: 4,
      time: '3:00 – 4:15 p.m.', place: 'Domaine de Val des Prés, Au Cap',
      text: 'Feel the rhythm of Seychelles. Moutya is a traditional dance with roots in the lives of enslaved Africans — a way of expressing hardship, emotion and community. In 2021 it was inscribed on UNESCO’s Representative List of the Intangible Cultural Heritage of Humanity.',
      discover: [
        'A live Moutya demonstration with drums and song',
        'The history and meaning behind the dance',
        'Traditional games, if arranged on the day',
      ],
      extra: { time: '3:45 – 4:15 p.m.', title: 'Refreshments & reflection', text: 'Relax with refreshments, ask questions and share your favourite moments of the day.' },
      photos: [{ src: 'moutya.jpg', cap: 'Traditional dance in full colour' }],
      tip: 'The Moutya demonstration and traditional games depend on the availability of local practitioners.',
    },
    {
      id: 'dropoff', badge: 'H', short: 'Drop-off', label: 'Drop-off',
      x: 380, y: 215, zoom: 1.7, rz: -10, pinOf: 0,
      time: '4:15 – 4:30 p.m.', view: 'finale',
    },
  ];

  // LEGS[i] travels from STOPS[i] to STOPS[i + 1]
  const LEGS = [
    { mode: 'drive', time: '8:30 – 9:00 a.m.', title: 'Travel to Victoria', zoom: 1.5,
      text: 'Settle in as your private vehicle winds over the hills from the coast into Victoria, one of the smallest capitals in the world.',
      d: 'M380 215 C 410 250, 450 235, 480 262 S 530 292, 555 300' },
    { mode: 'walk', time: '9:45 – 10:00 a.m.', title: 'Walk to the National Museum', zoom: 3.0,
      text: 'A short stroll through town from the market to the National Museum of History.',
      d: 'M555 300 C 563 309, 557 322, 542 322' },
    { mode: 'drive', time: '11:00 a.m. – 11:45 a.m.', title: 'Travel to Mission Lodge', zoom: 2.0,
      text: 'Climb the winding mountain road out of Victoria to Venn’s Town at Sans Souci.',
      d: 'M542 322 C 520 335, 505 318, 490 338 S 470 366, 455 352 S 436 330, 420 345' },
    { mode: 'drive', time: '12:15 – 1:00 p.m.', title: 'Travel to Au Cap', zoom: 1.25,
      text: 'Back down the mountain and south along the east coast, past the airport, to Maison Marengo at Domaine de Val des Prés.',
      d: 'M420 345 C 445 372, 482 360, 508 382 C 540 412, 584 436, 598 480 C 610 520, 604 570, 615 602 C 624 630, 640 640, 645 660' },
    { mode: 'walk', time: '2:00 p.m.', title: 'Into the craft village', zoom: 3.1,
      text: 'A few steps from the lunch table into Domaine de Val des Prés Craft Village.',
      d: 'M645 660 C 634 664, 631 671, 636 677' },
    { mode: 'walk', time: '3:00 p.m.', title: 'Gather for Moutya', zoom: 3.1,
      text: 'Join the group for the afternoon’s cultural performance.',
      d: 'M636 677 C 642 686, 648 690, 653 692' },
    { mode: 'drive', time: '4:15 – 4:30 p.m.', title: 'Heading home', zoom: 1.05,
      text: 'Your guide thanks you for joining the tour, and your driver takes you back to the agreed drop-off point.',
      d: 'M653 692 C 640 650, 626 610, 618 565 C 610 520, 604 470, 582 425 C 565 390, 545 350, 530 318 C 505 280, 470 255, 440 245 C 410 236, 392 228, 380 215' },
  ];

  const MENU = [
    { course: 'Appetizer', items: ['Banana chips', 'Breadfruit chips'] },
    { course: 'Main course', items: ['Plain rice', 'Octopus curry', 'Grilled fish', 'Salted fish chutney with mango', 'Sausage rougail (salted sausage)', 'Lentils with salted meat (pork)'] },
    { course: 'Dessert', items: ['Banana nougat', 'Coconut flan', 'Daube'] },
  ];

  const SCHEDULE = [
    ['8:00 – 8:30 a.m.', 'Hotel pick-up', 'Meet your guide and driver, who welcome you aboard and explain the day’s programme.', 0],
    ['8:30 – 9:00 a.m.', 'Travel to Victoria', 'By private vehicle from your hotel to Victoria.'],
    ['9:00 – 9:45 a.m.', 'Victoria market', 'Explore the market, discover local produce and learn how fish, spices and vegetables are used in Creole cuisine.', 1],
    ['9:45 – 10:00 a.m.', 'Walk to the National Museum', 'A short walk from the market to the National Museum of History.'],
    ['10:00 – 11:00 a.m.', 'National Museum of History', 'Visit selected exhibits and learn about the history and cultural development of Seychelles.', 2],
    ['11:00 – 11:45 a.m.', 'Travel to Mission Lodge', 'By private vehicle to Venn’s Town – Mission Lodge at Sans Souci.'],
    ['11:45 a.m. – 12:15 p.m.', 'Venn’s Town – Mission Lodge', 'Explore the historic site and learn about liberated Africans and the educational mission established there.', 3],
    ['12:15 – 1:00 p.m.', 'Travel to Au Cap', 'By private vehicle to Maison Marengo at Domaine de Val des Prés.'],
    ['1:00 – 2:00 p.m.', 'Creole lunch at Maison Marengo', 'Enjoy a pre-arranged Creole meal and discover local ingredients and cooking traditions.', 4],
    ['2:00 – 3:00 p.m.', 'Domaine de Val des Prés Craft Village', 'Explore the craft village, discover traditional architecture and learn about local craftsmanship.', 5],
    ['3:00 – 3:45 p.m.', 'Moutya cultural experience', 'A Moutya demonstration and the story of its history and significance. Traditional games may be included if arranged.', 6],
    ['3:45 – 4:15 p.m.', 'Refreshments and reflection', 'Enjoy refreshments, ask questions and talk about the day’s cultural experiences.', 6],
    ['4:15 – 4:30 p.m.', 'Tour conclusion', 'Thank you for joining us — departure for the agreed drop-off point.', 7],
  ];

  // ---------------------------------------------------------------- helpers
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const ICON = {
    pin: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>',
    car: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M3 11h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="13.5" r="1" fill="currentColor"/><circle cx="16" cy="13.5" r="1" fill="currentColor"/></svg>',
    walk: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="13" cy="4" r="2" fill="currentColor"/><path d="M10 21l2-6 3 3v3M12 15l-1-5 4 1 2 3M11 10l-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  };

  // ---------------------------------------------------------------- DOM refs
  const body = document.body;
  const stage = $('#stage');
  const board = $('#board');
  const legsG = $('#legs');
  const ringsG = $('#rings');
  const arrow = $('#arrow');
  const pinsEl = $('#pins');
  const panelContent = $('#panelContent');
  const nextBtn = $('#nextBtn');
  const nextLabel = $('#nextLabel');
  const prevBtn = $('#prevBtn');
  const timeline = $('#timeline');

  // ---------------------------------------------------------------- build map
  const legEls = LEGS.map((leg, i) => {
    const g = svgEl('g', { class: 'leg' }, legsG);
    const base = svgEl('path', { d: leg.d, class: 'leg-base' + (leg.mode === 'walk' ? ' walk' : '') }, g);
    const glow = svgEl('path', { d: leg.d, class: 'leg-glow' }, g);
    const trail = svgEl('path', { d: leg.d, class: 'leg-trail' }, g);
    const spark = svgEl('path', { d: leg.d, class: 'leg-spark' }, g);
    const len = base.getTotalLength();
    trail.style.strokeDasharray = `${len} ${len + 10}`;
    trail.style.strokeDashoffset = len;
    return { g, base, glow, trail, spark, len, i };
  });

  const ringEls = STOPS.map((s, i) => {
    if (s.pinOf !== undefined) return null;
    const base = svgEl('circle', { cx: s.x, cy: s.y, r: 7, class: 'ring-base' }, ringsG);
    const burst1 = svgEl('circle', { cx: s.x, cy: s.y, r: 8, class: 'ring' }, ringsG);
    const burst2 = svgEl('circle', { cx: s.x, cy: s.y, r: 8, class: 'ring' }, ringsG);
    return { base, burst1, burst2 };
  });

  const pinEls = STOPS.map((s, i) => {
    if (s.pinOf !== undefined) return null;
    const el = document.createElement('div');
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.className = 'pin';
    el.innerHTML = `<span class="pin-label">${s.label}<small>${s.time}</small></span><span class="pin-head">${s.badge}</span><span class="pin-stem"></span>`;
    el.setAttribute('aria-label', s.label);
    el.addEventListener('click', () => { if (!body.classList.contains('is-intro')) goTo(i); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.stopPropagation(); el.click(); } });
    pinsEl.appendChild(el);
    return el;
  });

  timeline.innerHTML = STOPS.map((s, i) =>
    `<button class="tl-item" type="button" data-i="${i}" title="${s.label} · ${s.time}">
       <span class="tl-dot">${s.badge}</span><span class="tl-text">${s.short}<small>${s.time.split('–')[0].trim()}</small></span>
     </button>`).join('');
  const tlItems = [...timeline.querySelectorAll('.tl-item')];
  tlItems.forEach(b => b.addEventListener('click', () => goTo(+b.dataset.i)));

  $('#schedule').innerHTML = SCHEDULE.map(([t, title, text, stop]) =>
    `<li class="${stop !== undefined ? 'is-stop' : 'is-travel'}" ${stop !== undefined ? `data-stop="${stop}" tabindex="0"` : ''}>
       <time>${t}</time><div><b>${title}</b><p>${text}</p></div>
     </li>`).join('');

  // ---------------------------------------------------------------- camera
  const cam = { x: 515, y: 610, s: .7, rz: -8, tilt: 48 };
  const target = { ...cam };
  const view = { ox: 0, oy: 0, vf: 1, pinScale: 1, fitAll: .8 };

  function layout() {
    const W = innerWidth, H = innerHeight;
    const mobile = W <= 820;
    const panelW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--panel-w')) || 440;
    let area;
    if (body.classList.contains('is-intro')) area = { x: 0, y: 0, w: W, h: H };
    else if (mobile) area = { x: 0, y: 100, w: W, h: H * 0.5 - 100 };
    else area = { x: 0, y: 80, w: W - panelW - 32, h: H - 80 - 70 };
    view.ox = area.x + area.w / 2;
    view.oy = area.y + area.h * 0.56;
    view.vf = clamp(Math.min(area.w, area.h * 1.25) / 820, 0.55, 1.05);
    view.pinScale = mobile ? 0.85 : 1;
    // fit the whole island (≈ 400 × 1100 units, foreshortened by the tilt)
    view.fitAll = clamp(Math.min(area.w * 0.9 / 480, area.h * 0.92 / (1100 * Math.cos(46 * Math.PI / 180))), 0.3, 1.3);
    stage.style.perspectiveOrigin = `${view.ox}px ${view.oy}px`;
  }

  // Project a map point to screen pixels using the same transform as the board.
  const camMatrix = { m: new DOMMatrix(), P: 1700 };
  function project(x, y) {
    const p = camMatrix.m.transformPoint(new DOMPoint(x, y, 0));
    const f = camMatrix.P / (camMatrix.P - p.z);
    return { x: view.ox + (p.x - view.ox) * f, y: view.oy + (p.y - view.oy) * f, f };
  }
  function drawPins() {
    const W = innerWidth, H = innerHeight;
    STOPS.forEach((s, i) => {
      const el = pinEls[i];
      if (!el) return;
      const p = project(s.x, s.y);
      const off = p.x < -80 || p.x > W + 80 || p.y < -40 || p.y > H + 160;
      el.style.visibility = off ? 'hidden' : '';
      if (off) return;
      const k = view.pinScale * clamp(0.75 + p.f * 0.25, 0.8, 1.15);
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%) scale(${k.toFixed(3)})`;
      el.style.zIndex = el.classList.contains('current') ? 5000 : Math.round(p.y);
    });
  }

  function applyCamera() {
    // Perspective grows with zoom so the near edge of the board never passes
    // behind the camera (which makes browsers cull parts of the 3D layer).
    camMatrix.P = 1700 * Math.max(cam.s, 0.7);
    stage.style.perspective = camMatrix.P.toFixed(1) + 'px';
    const m = new DOMMatrix()
      .translate(view.ox, view.oy, 0)
      .rotateAxisAngle(1, 0, 0, cam.tilt)
      .rotateAxisAngle(0, 0, 1, cam.rz)
      .scale(cam.s, cam.s, 1)
      .translate(-cam.x, -cam.y, 0);
    camMatrix.m = m;
    board.style.transform = m.toString();
    drawPins();
  }

  function focusStop(i) {
    const s = STOPS[i];
    Object.assign(target, { x: s.x, y: s.y, s: s.zoom * view.vf, rz: s.rz, tilt: 50 });
  }
  function focusOverview() {
    Object.assign(target, { x: 518, y: 620, s: view.fitAll, rz: -6, tilt: 44 });
  }

  // ---------------------------------------------------------------- arrow
  const arrowPos = { x: STOPS[0].x, y: STOPS[0].y, a: 0 };
  function pointOnLeg(i, p) {
    const L = legEls[i];
    const d = clamp(p, 0, 1) * L.len;
    const a = L.base.getPointAtLength(d);
    const b = L.base.getPointAtLength(clamp(d + 1.5, 0, L.len));
    const c = L.base.getPointAtLength(clamp(d - 1.5, 0, L.len));
    return { x: a.x, y: a.y, a: Math.atan2(b.y - c.y, b.x - c.x) * 180 / Math.PI };
  }
  function placeArrowAtStop(i) {
    needsDraw = true;
    if (i < LEGS.length) Object.assign(arrowPos, pointOnLeg(i, 0));
    else Object.assign(arrowPos, pointOnLeg(i - 1, 1));
  }
  function drawArrow() {
    const rad = arrowPos.a * Math.PI / 180;
    const p = project(arrowPos.x, arrowPos.y);
    const q = project(arrowPos.x + Math.cos(rad) * 6, arrowPos.y + Math.sin(rad) * 6);
    const a = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
    const k = view.pinScale * clamp(0.75 + p.f * 0.25, 0.8, 1.15);
    arrow.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%) rotate(${a.toFixed(1)}deg) scale(${k.toFixed(3)})`;
  }

  // ---------------------------------------------------------------- route state
  function setLegProgress(i, p) {
    const L = legEls[i];
    L.trail.style.strokeDashoffset = (L.len * (1 - p)).toFixed(2);
  }
  function lightLeg(i, animate) {
    const L = legEls[i];
    setLegProgress(i, 1);
    L.g.classList.add('lit');
    if (animate && !reduceMotion) {
      L.spark.style.strokeDasharray = `26 ${L.len + 40}`;
      L.spark.animate(
        [{ strokeDashoffset: 26, opacity: 1 }, { strokeDashoffset: -L.len, opacity: 1 }, { strokeDashoffset: -L.len, opacity: 0 }],
        { duration: 1300, easing: 'cubic-bezier(.3,.1,.2,1)' });
      L.glow.animate([{ strokeOpacity: .9 }, { strokeOpacity: .32 }], { duration: 1600, easing: 'ease-out' });
    }
  }
  function unlightLeg(i) {
    const L = legEls[i];
    L.g.classList.remove('lit');
    setLegProgress(i, 0);
  }
  function burst(i) {
    const idx = STOPS[i].pinOf ?? i;
    const r = ringEls[idx];
    if (!r || reduceMotion) return;
    const kf = [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(6)', opacity: 0 }];
    r.burst1.animate(kf, { duration: 1300, easing: 'ease-out' });
    r.burst2.animate(kf, { duration: 1300, delay: 250, easing: 'ease-out' });
  }

  function syncMarkers() {
    const cur = state.cur;
    const finale = cur === STOPS.length - 1;
    STOPS.forEach((s, i) => {
      const pin = pinEls[i];
      if (!pin) return;
      const isCur = !state.traveling && (i === cur || (finale && i === 0));
      const visited = i < cur || finale;
      pin.classList.toggle('current', isCur && !body.classList.contains('is-intro'));
      pin.classList.toggle('visited', visited && !isCur);
      ringEls[i].base.classList.toggle('current', isCur);
      ringEls[i].base.classList.toggle('visited', visited);
    });
    // hotel pin doubles as the drop-off
    const hotelLabel = pinEls[0].querySelector('.pin-label');
    hotelLabel.innerHTML = finale
      ? `Drop-off<small>${STOPS[7].time}</small>`
      : `${STOPS[0].label}<small>${STOPS[0].time}</small>`;
    needsDraw = true;
    legEls.forEach((L, i) => L.g.classList.toggle('next', !state.traveling && i === cur && !body.classList.contains('is-intro')));
    tlItems.forEach((b, i) => {
      b.classList.toggle('current', i === cur && !state.traveling);
      b.classList.toggle('visited', i < cur || (state.traveling && i === cur));
      if (i === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    const curItem = tlItems[cur];
    if (curItem && timeline.scrollWidth > timeline.clientWidth) {
      timeline.scrollTo({ left: curItem.offsetLeft - timeline.clientWidth / 2 + curItem.clientWidth / 2, behavior: 'smooth' });
    }
  }

  // ---------------------------------------------------------------- panel views
  const photosHTML = photos => !photos ? '' :
    `<div class="photos ${photos.length === 1 ? 'single' : ''}">
      ${photos.map(p => `<button class="photo" type="button" data-src="${IMG + p.src}" data-cap="${p.cap}">
        <img src="${IMG + p.src}" alt="${p.cap}" loading="lazy" decoding="async"${p.top ? ' style="object-position: top"' : ''} /><span>${p.cap}</span></button>`).join('')}
    </div>`;

  const menuHTML = () =>
    `<div class="menu">
      <p class="eyebrow">Maison Marengo</p>
      <h3>Today’s Creole Menu</h3>
      <p class="menu-sub">Served 1:00 – 2:00 p.m.</p>
      ${MENU.map(m => `<div class="menu-course"><h4>${m.course}</h4><ul>${m.items.map(it => `<li>${it}</li>`).join('')}</ul></div>`).join('')}
      <p class="menu-foot">Domaine de Val des Prés, Au Cap</p>
    </div>`;

  function stopHTML(i) {
    const s = STOPS[i];
    if (s.view === 'welcome') {
      return `<div class="view">
        <div class="welcome-art"><img src="assets/logo.jpg" alt="Island Essence DMC" /></div>
        <div class="stop-meta"><span class="chip time">${s.time}</span><span class="chip">Starting point</span></div>
        <h2 class="stop-title">Bonzour &amp; welcome!</h2>
        <p class="stop-place">${ICON.pin} Hotel pick-up</p>
        <p class="stop-text">Your guide and driver meet you at your hotel, welcome you aboard and walk you through the day’s programme. Follow the arrow on the map — each stop lights up as you reach it.</p>
        <p class="block-title">Today’s route</p>
        <ol class="route-list">
          ${STOPS.slice(1, -1).map(x => `<li><b>${x.label}</b><span>${x.time}</span></li>`).join('')}
          <li><b>Back to your hotel</b><span>${STOPS[7].time}</span></li>
        </ol>
        <div class="tip">${ICON.info}<span>Wear comfortable walking shoes, bring sun protection and carry drinking water.</span></div>
      </div>`;
    }
    if (s.view === 'finale') {
      return `<div class="view finale">
        <div class="stop-meta"><span class="chip time">${s.time}</span><span class="chip gold">Journey complete</span></div>
        <p class="big-thanks">Mersi!</p>
        <h2 class="stop-title">Thank you for travelling with us</h2>
        <p class="stop-text">From the bustle of Victoria’s market to the rhythm of Moutya, you’ve followed a living Creole story across Mahé. We hope you take a little of the island’s essence home with you.</p>
        <p class="block-title">Your journey today</p>
        <ol class="route-list">
          ${STOPS.slice(1, -1).map(x => `<li><b>${x.label}</b><span>${x.time}</span></li>`).join('')}
        </ol>
        <div class="welcome-art"><img src="assets/logo.jpg" alt="Island Essence DMC" /></div>
      </div>`;
    }
    return `<div class="view">
      <div class="stop-meta"><span class="chip time">${s.time}</span><span class="chip">Stop ${s.badge} of 6</span></div>
      <h2 class="stop-title">${s.label}</h2>
      <p class="stop-place">${ICON.pin} ${s.place}</p>
      <p class="stop-text">${s.text}</p>
      ${s.menu ? menuHTML() : ''}
      ${photosHTML(s.photos)}
      ${s.discover ? `<p class="block-title">What you’ll discover</p><ul class="discover">${s.discover.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
      ${s.extra ? `<p class="block-title">${s.extra.time} · ${s.extra.title}</p><p class="stop-text">${s.extra.text}</p>` : ''}
      ${s.quote ? `<blockquote class="quote">“${s.quote}”<footer>From your guide</footer></blockquote>` : ''}
      ${s.tip ? `<div class="tip">${ICON.info}<span>${s.tip}</span></div>` : ''}
    </div>`;
  }

  function travelHTML(i) {
    const leg = LEGS[i], from = STOPS[i], to = STOPS[i + 1];
    return `<div class="view travel">
      <div class="stop-meta"><span class="chip time">${leg.time}</span><span class="chip">${leg.mode === 'walk' ? 'On foot' : 'By private vehicle'}</span></div>
      <h2 class="stop-title">${leg.title}</h2>
      <p class="stop-place">${ICON.pin} Next: ${to.label}</p>
      <div class="travel-visual">
        <div class="travel-road"></div>
        <div class="travel-progress" id="tvProgress"></div>
        <div class="travel-track"><div class="travel-mover" id="tvIcon"><div class="travel-icon">${leg.mode === 'walk' ? ICON.walk : ICON.car}</div></div></div>
        <div class="travel-ends"><span>${from.short}</span><span>${to.short}</span></div>
      </div>
      <p class="stop-text">${leg.text}</p>
    </div>`;
  }

  function renderPanel(html) {
    panelContent.innerHTML = html;
    panelContent.scrollTop = 0;
  }

  function updateNav() {
    const cur = state.cur, last = STOPS.length - 1;
    prevBtn.disabled = state.traveling || cur === 0;
    nextBtn.disabled = state.traveling;
    nextBtn.classList.toggle('glow', !state.traveling);
    if (state.traveling) nextLabel.textContent = 'On the way…';
    else if (cur === last) nextLabel.textContent = 'Replay the journey';
    else if (cur === 0) nextLabel.textContent = 'Set off for Victoria';
    else nextLabel.textContent = `Next: ${STOPS[cur + 1].short}`;
  }

  // ---------------------------------------------------------------- flow
  const state = { cur: 0, traveling: null };

  function arrive(i, animate) {
    state.cur = i;
    state.traveling = null;
    placeArrowAtStop(i);
    if (i > 0) lightLeg(i - 1, animate);
    if (animate) burst(i);
    renderPanel(stopHTML(i));
    syncMarkers();
    updateNav();
    if (i === STOPS.length - 1) {
      focusStop(i);
      setTimeout(() => { if (state.cur === STOPS.length - 1 && !state.traveling) focusOverview(); }, animate ? 1400 : 0);
    } else {
      focusStop(i);
    }
  }

  function travel(i) {
    const L = legEls[i];
    const dur = reduceMotion ? 300 : clamp(L.len * 9, 1800, 5600);
    state.traveling = { i, start: performance.now(), dur };
    renderPanel(travelHTML(i));
    state.tv = { p: $('#tvProgress'), ic: $('#tvIcon') };
    syncMarkers();
    updateNav();
    target.s = LEGS[i].zoom * view.vf;
    target.rz = lerp(STOPS[i].rz, STOPS[i + 1].rz, 0.5);
    target.tilt = 54;
  }

  function stepTravel(now) {
    const T = state.traveling;
    if (!T) return;
    const t = clamp((now - T.start) / T.dur, 0, 1);
    const p = ease(t);
    Object.assign(arrowPos, pointOnLeg(T.i, p));
    setLegProgress(T.i, p);
    target.x = arrowPos.x;
    target.y = arrowPos.y;
    if (state.tv && state.tv.p) {
      state.tv.p.style.transform = `scaleX(${p.toFixed(4)})`;
      state.tv.ic.style.transform = `translateX(${(p * 100).toFixed(2)}%)`;
    }
    if (t >= 1) arrive(T.i + 1, true);
  }

  function next() {
    if (state.traveling) return;
    if (state.cur >= STOPS.length - 1) return replay();
    travel(state.cur);
  }

  function goTo(k) {
    k = clamp(k, 0, STOPS.length - 1);
    state.traveling = null;
    legEls.forEach((_, i) => (i < k ? lightLeg(i, false) : unlightLeg(i)));
    arrive(k, k > 0);
  }

  function replay() {
    legEls.forEach((_, i) => unlightLeg(i));
    goTo(0);
  }

  function begin(stop = 0) {
    body.classList.remove('is-intro');
    layout();
    goTo(stop);
  }

  function resetToIntro() {
    state.traveling = null;
    state.cur = 0;
    legEls.forEach((_, i) => unlightLeg(i));
    placeArrowAtStop(0);
    body.classList.add('is-intro');
    layout();
    focusOverview();
    syncMarkers();
    updateNav();
  }

  // ---------------------------------------------------------------- loop
  let last = performance.now();
  let needsDraw = true;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    stepTravel(now);
    if (body.classList.contains('is-intro')) {
      target.rz = -6 + Math.sin(now / 5000) * 7;
      target.x = 518 + Math.sin(now / 7000) * 18;
    }
    const k = 1 - Math.exp(-dt * (state.traveling ? 5 : 2.6));
    cam.x = lerp(cam.x, target.x, k);
    cam.y = lerp(cam.y, target.y, k);
    cam.s = lerp(cam.s, target.s, k * 0.8);
    cam.rz = lerp(cam.rz, target.rz, k * 0.7);
    cam.tilt = lerp(cam.tilt, target.tilt, k * 0.7);
    // Only touch the DOM while something is moving, so the browser can settle
    // and rasterise the map crisply once the camera comes to rest.
    const moving = state.traveling || body.classList.contains('is-intro') ||
      Math.abs(cam.x - target.x) > .02 || Math.abs(cam.y - target.y) > .02 ||
      Math.abs(cam.s - target.s) > .0005 || Math.abs(cam.rz - target.rz) > .01 || Math.abs(cam.tilt - target.tilt) > .01;
    if (moving || needsDraw) {
      applyCamera();
      drawArrow();
      needsDraw = false;
    }
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- events
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', () => { if (!state.traveling && state.cur > 0) goTo(state.cur - 1); });
  $('#beginBtn').addEventListener('click', () => begin(0));
  $('#brandHome').addEventListener('click', e => { e.preventDefault(); resetToIntro(); });

  const programme = $('#programme');
  const openProgramme = () => programme.showModal();
  $('#openProgramme').addEventListener('click', openProgramme);
  $('#introProgramme').addEventListener('click', openProgramme);
  $('#schedule').addEventListener('click', e => {
    const li = e.target.closest('[data-stop]');
    if (!li) return;
    programme.close();
    if (body.classList.contains('is-intro')) begin(+li.dataset.stop); else goTo(+li.dataset.stop);
  });
  $('#schedule').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.stop) e.target.click(); });

  const lightbox = $('#lightbox');
  panelContent.addEventListener('click', e => {
    const ph = e.target.closest('.photo');
    if (!ph) return;
    $('#lightboxImg').src = ph.dataset.src;
    $('#lightboxImg').alt = ph.dataset.cap;
    $('#lightboxCap').textContent = ph.dataset.cap;
    lightbox.showModal();
  });
  document.querySelectorAll('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });

  addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) return;
    if (body.classList.contains('is-intro')) {
      if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); begin(0); }
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft' && !state.traveling && state.cur > 0) goTo(state.cur - 1);
  });

  addEventListener('resize', () => {
    layout();
    if (body.classList.contains('is-intro') || state.cur === STOPS.length - 1) focusOverview();
    else if (!state.traveling) focusStop(state.cur);
  });

  // ---------------------------------------------------------------- start
  layout();
  focusOverview();
  Object.assign(cam, target, { s: target.s * 0.75, tilt: 60, rz: -18 });
  placeArrowAtStop(0);
  syncMarkers();
  updateNav();
  requestAnimationFrame(frame);

  // Deep link: index.html#stop-3 opens directly at a stop
  const m = location.hash.match(/stop-(\d)/);
  if (m) begin(+m[1]);
})();
