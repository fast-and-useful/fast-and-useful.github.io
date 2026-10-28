// Interactive sections for the Fast and Useful page: grouped accuracy bars
// (main results, ablations, fine-grained transfer) and accuracy against
// generation time. Numbers are the paper draft's
// (Overleaf 033c8df): Table S-main-complete (tables/t1-main.tex) for the
// main and cost charts, with seconds per image at full precision from
// code/results/sets.csv (the input of Fig. 4); Table 2 (t2-ablation);
// Table 4 (t3-finegrained); Fig. 3 for SDA and DP-DMD. Plain SVG, no libraries.
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The paper's palette: released orange, base-first green, ours violet, unguided base blue.
  var ROLE = {
    released: { color: '#eb6834', name: 'Released student' },
    basefirst: { color: '#1baf7a', name: 'Base-first hybrid (base at generation)' },
    ours: { color: '#4a3aa7', name: 'Ours: adapted first step' },
    base: { color: '#2a78d6', name: 'Base, no guidance' },
    guided: { color: '#9dbfe9', name: 'Base, default guidance' },
    other: { color: '#6f706f', name: 'Other method' },
    variant: { color: '#94a3b8', name: 'Ablation variant' }
  };

  // ------------------------------------------------------------- data
  // v: { view: [mean, sd] }; a missing view means not evaluated there.
  var MAIN = {
    views: [
      { id: 'in100', label: 'ImageNet-100', sub: 'ResNet-50 top-1 on real ImageNet-100 validation images, 500 generated images per class.',
        insight: 'All three adapters beat their base-first samplers with fewer denoiser evaluations. The unguided bases stay ahead; at default guidance the same bases fall far below them.' },
      { id: 'c200', label: '200 classes', sub: 'A 200-class ImageNet protocol, 500 generated images per class. It informed development and includes classes absent from adapter training.',
        insight: 'The ranking holds with twice the classes: adapter above base-first above the released student, in every family.' },
      { id: 'in1k', label: 'ImageNet-1k', sub: 'Full ImageNet-1k, 1,281 generated images per class, adapters and samplers fixed beforehand.',
        insight: 'At full scale the adapters beat base-first by 3.5 [2.9, 4.1] points on klein and 5.4 [5.0, 5.8] on SD-Turbo (paired 95% class-bootstrap intervals). Klein’s adapter recovers 90% of its unguided 20-step base’s gain over the released student.' }
    ],
    max: 55,
    note: 'Mean ± SD over three classifier seeds. Our ImageNet-100 bars pool three adapter-training runs × three classifier seeds (N = 9); elsewhere one adapter run. Z-Image-Turbo’s released student uses its own nine steps; SDA uses its documented eight-step sampler, where the released student scores 13.8 ± 0.4.',
    groups: [
      { label: 'FLUX.2-klein', rows: [
        { label: 'Released student', role: 'released', nfe: 4, v: { in100: [17.1, 0.4], c200: [19.1, 0.0], in1k: [8.4, 0.1] } },
        { label: 'Base-first', role: 'basefirst', nfe: 4, v: { in100: [39.9, 0.3], c200: [43.7, 0.1], in1k: [30.8, 0.1] } },
        { label: 'Ours', role: 'ours', nfe: 2, v: { in100: [43.8, 0.4], c200: [48.6, 0.3], in1k: [34.2, 0.1] } },
        { label: 'Base, no guidance, 50 steps', short: 'Base, unguided 50', role: 'base', nfe: 50, v: { in100: [45.1, 0.0], c200: [48.2, 0.1] } },
        { label: 'Base, no guidance, 20 steps', short: 'Base, unguided 20', role: 'base', nfe: 20, v: { in100: [44.7, 0.9], in1k: [37.2, 0.1] } },
        { label: 'Base, default guidance', short: 'Base, guided', role: 'guided', nfe: 100, v: { in100: [23.6, 0.5], c200: [27.0, 0.2] } }
      ] },
      { label: 'SD-Turbo (base: SD 2.1)', rows: [
        { label: 'Released student', role: 'released', nfe: 4, v: { in100: [18.3, 0.3], c200: [19.8, 0.3], in1k: [12.7, 0.2] } },
        { label: 'Base-first', role: 'basefirst', nfe: 4, v: { in100: [36.4, 0.9], c200: [36.0, 0.2], in1k: [26.7, 0.3] } },
        { label: 'Ours', role: 'ours', nfe: 3, v: { in100: [43.7, 0.6], c200: [41.3, 0.8], in1k: [32.1, 0.3] } },
        { label: 'SD 2.1, no guidance, 30 steps', short: 'Base, unguided 30', role: 'base', nfe: 30, v: { in100: [49.8, 0.7], c200: [45.7, 0.9] } },
        { label: 'SD 2.1, default guidance', short: 'Base, guided', role: 'guided', nfe: 60, v: { in100: [30.0, 0.1], c200: [31.5, 0.3] } }
      ] },
      { label: 'Z-Image-Turbo', rows: [
        { label: 'Released student', role: 'released', nfe: 9, v: { in100: [14.0, 0.0], c200: [13.9, 0.4] } },
        { label: 'SDA, public diversity LoRA', short: 'SDA', role: 'other', nfe: 8, v: { in100: [25.1, 0.1] } },
        { label: 'Base-first', role: 'basefirst', nfe: 9, v: { in100: [32.8, 0.9], c200: [35.3, 0.3] } },
        { label: 'Ours', role: 'ours', nfe: 7, v: { in100: [35.1, 0.5], c200: [38.2, 0.3] } },
        { label: 'Base, no guidance, 50 steps', short: 'Base, unguided 50', role: 'base', nfe: 50, v: { in100: [45.6, 0.7] } },
        { label: 'Base, default guidance', short: 'Base, guided', role: 'guided', nfe: 100, v: { in100: [17.6, 0.3] } }
      ] },
      { label: 'DP-DMD’s released student (SD3.5-Medium)', rows: [
        { label: 'DP-DMD student', role: 'released', nfe: 4, v: { in100: [13.9, 0.2] } },
        { label: 'DP-DMD + ours', role: 'ours', nfe: 3, v: { in100: [27.3, 0.2] } },
        { label: 'SD3.5-Medium, no guidance', short: 'Base, unguided', role: 'base', nfe: 28, v: { in100: [44.9, 0.3] } }
      ] }
    ]
  };

  var ABLATION = {
    views: [
      { id: 'klein', label: 'FLUX.2-klein', sub: 'ImageNet-100 top-1, ResNet-50, 500 generated images per class. Guided-target and endpoint variants use the finer teacher grid.',
        insight: 'A target at default guidance keeps 3 of the 26.7 points our adapter gains; jumping only to the student’s first level keeps 15. Rank 8 to 128 and full fine-tuning stay within 0.7 points.' },
      { id: 'sdt', label: 'SD-Turbo', sub: 'ImageNet-100 top-1, ResNet-50, 500 generated images per class.',
        insight: 'The same order on SD-Turbo: the default-guidance target and the first-level jump each give up about half of the gain, and skipping the first step without training falls below the released student.' }
    ],
    max: 50,
    ref: true,
    note: 'Mean ± SD over three classifier seeds. Ours and SD-Turbo rank 128 pool three adapter runs; other variants use one. FSG, MoNO and skipping step 1 require no training. “Adapter in every step” reuses the first-step-trained checkpoint at every step of the adapted schedule.',
    groups: [
      { label: 'Ours', rows: [
        { label: 'Unguided target, step 1, rank 32', short: 'Ours', role: 'ours', v: { klein: [43.8, 0.4], sdt: [43.7, 0.6] } },
        { label: 'Same, finer teacher grid', short: 'Ours, finer grid', role: 'ours', v: { klein: [43.2, 0.7] } }
      ] },
      { label: 'Target guidance', rows: [
        { label: 'Target at guidance 2', short: 'Guidance 2', role: 'variant', v: { klein: [31.5, 0.7], sdt: [41.2, 0.9] } },
        { label: 'Target at default guidance', short: 'Default guidance', role: 'variant', v: { klein: [20.1, 0.4], sdt: [30.4, 0.4] } }
      ] },
      { label: 'Jump endpoint', rows: [
        { label: 'Jump to the first level only', short: 'First level only', role: 'variant', v: { klein: [32.1, 0.6], sdt: [32.2, 0.4] } },
        { label: 'Jump to a deeper level', short: 'Deeper level', role: 'variant', v: { klein: [40.0, 0.5], sdt: [41.2, 0.7] } }
      ] },
      { label: 'Placement and capacity', rows: [
        { label: 'Adapter in every step', short: 'Every step', role: 'variant', v: { klein: [41.4, 0.3], sdt: [38.8, 0.8] } },
        { label: 'Every weight fine-tuned', short: 'Full fine-tune', role: 'variant', v: { klein: [43.2, 1.0], sdt: [43.4, 0.3] } },
        { label: 'Rank 8', role: 'variant', v: { klein: [43.4, 0.3], sdt: [43.3, 0.3] } },
        { label: 'Rank 128', role: 'variant', v: { klein: [44.1, 0.4], sdt: [44.4, 0.6] } }
      ] },
      { label: 'Training-free alternatives', rows: [
        { label: 'FSG', role: 'other', v: { klein: [20.7, 0.7] } },
        { label: 'MoNO, 4 images per basis', short: 'MoNO, 4 per basis', role: 'other', v: { klein: [26.8, 0.3] } },
        { label: 'MoNO, 32 images per basis', short: 'MoNO, 32 per basis', role: 'other', v: { klein: [29.9, 0.3] } },
        { label: 'Skip the first step', short: 'Skip first step', role: 'other', v: { klein: [31.8, 0.3], sdt: [14.4, 0.7] } }
      ] },
      { label: 'Reference', rows: [
        { label: 'Released student alone', short: 'Released student', role: 'released', v: { klein: [17.1, 0.4], sdt: [18.3, 0.3] } }
      ] }
    ]
  };

  var FINEGRAINED = {
    views: [
      { id: 'food', label: 'Food-101', sub: '101 dishes, real test images.',
        insight: 'Every adapter beats its released student and, where shown, base-first and SDA; DP-DMD’s student rises from 6.9 to 21.8.' },
      { id: 'cars', label: 'Stanford Cars', sub: '196 car models, real test images.',
        insight: 'The one fine-grained case where an adapter trails base-first: klein, 36.2 against 38.8. SD-Turbo’s adapter leads base-first by 3.5 points.' },
      { id: 'pets', label: 'Oxford-IIIT Pets', sub: '37 cat and dog breeds, real test images.',
        insight: 'Z-Image-Turbo’s adapter leads SDA by 11.6 points, and DP-DMD’s student nearly quadruples, from 12.5 to 46.6.' }
    ],
    max: 70,
    note: 'ResNet-50 top-1, 500 generated images per class, mean ± SD over three classifier seeds; one adapter run, trained on ImageNet-100 class names and applied unchanged.',
    groups: [
      { label: 'FLUX.2-klein', rows: [
        { label: 'Released student', role: 'released', nfe: 4, v: { food: [10.5, 0.3], cars: [18.9, 0.4], pets: [20.5, 1.0] } },
        { label: 'Base-first', role: 'basefirst', nfe: 4, v: { food: [25.9, 0.1], cars: [38.8, 0.3], pets: [45.3, 0.5] } },
        { label: 'Ours', role: 'ours', nfe: 2, v: { food: [30.9, 0.2], cars: [36.2, 0.2], pets: [46.2, 0.8] } }
      ] },
      { label: 'SD-Turbo', rows: [
        { label: 'Released student', role: 'released', nfe: 4, v: { food: [10.0, 0.3], cars: [46.9, 0.4], pets: [19.5, 1.4] } },
        { label: 'Base-first', role: 'basefirst', nfe: 4, v: { food: [27.3, 0.2], cars: [64.8, 0.5], pets: [50.6, 0.9] } },
        { label: 'Ours', role: 'ours', nfe: 3, v: { food: [31.8, 0.2], cars: [68.3, 0.2], pets: [54.5, 0.9] } }
      ] },
      { label: 'Z-Image-Turbo', rows: [
        { label: 'Released student', role: 'released', nfe: 9, v: { food: [9.2, 0.3], cars: [27.6, 0.3], pets: [15.4, 0.6] } },
        { label: 'SDA, public diversity LoRA', short: 'SDA', role: 'other', nfe: 8, v: { food: [16.8, 0.3], cars: [54.6, 0.2], pets: [37.8, 0.4] } },
        { label: 'Ours', role: 'ours', nfe: 7, v: { food: [23.4, 0.5], cars: [60.0, 0.1], pets: [49.4, 0.9] } }
      ] },
      { label: 'DP-DMD’s released student', rows: [
        { label: 'DP-DMD student', role: 'released', nfe: 4, v: { food: [6.9, 0.2], cars: [45.4, 0.7], pets: [12.5, 0.3] } },
        { label: 'DP-DMD + ours', role: 'ours', nfe: 3, v: { food: [21.8, 0.4], cars: [56.4, 0.7], pets: [46.6, 0.8] } }
      ] }
    ]
  };

  // [label, role, top-1 mean, sd, seconds per image, NFE]; 'base' points join into one line.
  var COST = [
    { id: 'klein', label: 'FLUX.2-klein', points: [
      ['Released student', 'released', 17.15, 0.44, 0.14, 4],
      ['Base-first', 'basefirst', 39.9, 0.3, 0.1522, 4],
      ['Ours', 'ours', 43.83, 0.37, 0.101, 2],
      ['Base, 10 steps', 'base', 41.39, 0.87, 0.3007, 10],
      ['Base, 20 steps', 'base', 44.71, 0.93, 0.5699, 20],
      ['Base, 50 steps', 'base', 45.08, 0.02, 1.3806, 50],
      ['Base, default guidance', 'guided', 23.64, 0.54, 2.8217, 100]
    ], insight: 'Ours is the fastest klein sampler, faster than the released student, and more accurate than the unguided base at 10 steps, which takes three times as long.' },
    { id: 'sdt', label: 'SD-Turbo', points: [
      ['Released student', 'released', 18.29, 0.26, 0.0291, 4],
      ['Base-first', 'basefirst', 36.39, 0.93, 0.0303, 4],
      ['Ours', 'ours', 43.68, 0.57, 0.0263, 3],
      ['SD 2.1, 10 steps', 'base', 46.68, 1.28, 0.0483, 10],
      ['SD 2.1, 30 steps', 'base', 49.76, 0.73, 0.1106, 30],
      ['SD 2.1, default guidance', 'guided', 29.99, 0.11, 0.1964, 60]
    ], insight: 'SD-Turbo is cheap enough that the unguided SD 2.1 base at 10 steps costs under twice as much per image and stays ahead; the adapter is the most accurate of the samplers at the student’s speed.' },
    { id: 'zt', label: 'Z-Image-Turbo', points: [
      ['Released student', 'released', 14.0, 0.02, 0.3712, 9],
      ['Base-first', 'basefirst', 32.76, 0.94, 0.3701, 9],
      ['Ours', 'ours', 35.15, 0.47, 0.3011, 7],
      ['Base, 50 steps', 'base', 45.65, 0.68, 1.9205, 50],
      ['Base, default guidance', 'guided', 17.59, 0.29, 3.78, 100]
    ], insight: 'Seven evaluations instead of nine: the adapter is faster than both the released student and base-first, and more accurate than either.' }
  ];

  // ------------------------------------------------------------- helpers
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function html(tag, cls, text, parent) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function pm(v) { return v[0].toFixed(1) + ' ± ' + v[1].toFixed(1); }
  function secs(s) { return s < 0.1 ? s.toFixed(3) : s.toFixed(2); }
  function chips(parent, label, items, initial, onPick) {
    var row = html('div', 'chip-row', null, parent);
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', label);
    html('span', 'chip-label', label, row);
    var buttons = items.map(function (it) {
      var b = html('button', 'chip', it.label, row);
      b.type = 'button';
      b.setAttribute('aria-pressed', it.id === initial ? 'true' : 'false');
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        onPick(it.id);
      });
      return b;
    });
  }
  function tooltip(card) {
    var t = html('div', 'viz-tooltip', null, card);
    t.setAttribute('role', 'status');
    return {
      show: function (content, evt) {
        t.innerHTML = content;
        t.classList.add('is-on');
        var box = card.getBoundingClientRect();
        var x = evt.clientX - box.left + 14, y = evt.clientY - box.top + 14;
        if (x + t.offsetWidth > box.width - 8) x = evt.clientX - box.left - t.offsetWidth - 14;
        if (y + t.offsetHeight > box.height - 8) y = evt.clientY - box.top - t.offsetHeight - 14;
        t.style.left = Math.max(8, x) + 'px';
        t.style.top = Math.max(8, y) + 'px';
      },
      hide: function () { t.classList.remove('is-on'); }
    };
  }
  function legend(card, roles) {
    var keys = html('div', 'viz-legend', null, card);
    keys.innerHTML = roles.map(function (r) {
      return '<span class="key"><span class="swatch" style="background:' + ROLE[r].color + '"></span>' + ROLE[r].name + '</span>';
    }).join('');
  }
  function usedRoles(spec) {
    var seen = {};
    spec.groups.forEach(function (g) { g.rows.forEach(function (r) { seen[r.role] = true; }); });
    return ['released', 'other', 'variant', 'basefirst', 'ours', 'base', 'guided'].filter(function (r) { return seen[r]; });
  }

  // ------------------------------------------------------------- grouped bars
  function bars(spec) {
    return function (card, W) {
      var narrow = W < 560;
      var labelW = narrow ? 128 : 220, right = narrow ? 70 : 92, top = 24, rowH = narrow ? 26 : 28, groupH = 30;
      var state = card._state || (card._state = { view: spec.views[0].id });
      var tip = tooltip(card);
      var sub = card.querySelector('.viz-subtitle');
      chips(card, 'Show', spec.views.map(function (v) { return { id: v.id, label: v.label }; }), state.view,
        function (id) { state.view = id; draw(); });
      var svg = el('svg', { class: 'viz-svg', role: 'img' }, card);
      legend(card, usedRoles(spec));
      var insight = html('div', 'viz-insight', null, card);
      insight.setAttribute('aria-live', 'polite');
      if (spec.note) html('div', 'viz-note', spec.note, card);
      var details = html('details', 'viz-table-toggle', null, card);
      html('summary', null, 'Show as a table', details);
      var table = html('table', 'table is-narrow is-striped', null, details);

      var drawnOnce = false;
      function draw() {
        var fade = drawnOnce && !reduceMotion;
        drawnOnce = true;
        var view = spec.views.filter(function (v) { return v.id === state.view; })[0];
        var H = top;
        spec.groups.forEach(function (g) {
          var n = g.rows.filter(function (r) { return r.v[view.id]; }).length;
          H += groupH + Math.max(n, 1) * rowH;
        });
        H += 4;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('width', W); svg.setAttribute('height', H);
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        function X(v) { return labelW + v / spec.max * (W - labelW - right); }
        var step = narrow ? 20 : 10, ticks = [];
        for (var t = 0; t <= spec.max + 1e-9; t += step) ticks.push(t);
        ticks.forEach(function (v) {
          el('line', { class: v === 0 ? 'zero-line' : 'grid-line', x1: X(v), x2: X(v), y1: top - 6, y2: H }, svg);
          el('text', { class: 'tick-label', x: X(v), y: top - 11, 'text-anchor': 'middle' }, svg).textContent = v + (v === ticks[ticks.length - 1] ? '%' : '');
        });
        var refV = null;
        if (spec.ref) spec.groups[0].rows.forEach(function (r) { if (refV == null && r.role === 'ours' && r.v[view.id]) refV = r.v[view.id][0]; });
        var summary = [], y = top, i = 0;
        spec.groups.forEach(function (g) {
          el('text', { class: 'group-label', x: 0, y: y + groupH - 9 }, svg).textContent = g.label;
          y += groupH;
          var rows = g.rows.filter(function (r) { return r.v[view.id]; });
          if (!rows.length) {
            el('text', { class: 'group-note', x: labelW, y: y + rowH / 2 + 4 }, svg).textContent = 'Not evaluated at this scale';
            y += rowH;
            return;
          }
          rows.forEach(function (r) {
            var v = r.v[view.id], cy = y + rowH / 2, c = ROLE[r.role].color;
            var gEl = el('g', { style: fade ? 'opacity:0;transition:opacity .3s ' + (i++ * 0.02) + 's' : '' }, svg);
            var name = narrow ? (r.short || r.label) : r.label;
            el('text', { class: 'row-label' + (r.role === 'ours' ? ' is-ours' : ''), x: labelW - 10, y: cy + 4, 'text-anchor': 'end' }, gEl).textContent = name;
            el('rect', { x: X(0), y: cy - 7, width: Math.max(1, X(v[0]) - X(0)), height: 14, rx: 2, fill: c }, gEl);
            if (v[1] > 0) {
              el('line', { class: 'whisker', x1: X(v[0] - v[1]), x2: X(v[0] + v[1]), y1: cy, y2: cy }, gEl);
              el('line', { class: 'whisker', x1: X(v[0] - v[1]), x2: X(v[0] - v[1]), y1: cy - 4, y2: cy + 4 }, gEl);
              el('line', { class: 'whisker', x1: X(v[0] + v[1]), x2: X(v[0] + v[1]), y1: cy - 4, y2: cy + 4 }, gEl);
            }
            el('text', { class: 'value-label', x: X(v[0] + v[1]) + 8, y: cy + 4, style: r.role === 'ours' ? 'font-weight:700;fill:' + c : '' }, gEl)
              .textContent = narrow ? v[0].toFixed(1) : pm(v);
            var hit = el('rect', { class: 'hit', x: 0, y: cy - rowH / 2, width: W, height: rowH }, gEl);
            hit.addEventListener('mousemove', function (e) {
              tip.show('<strong>' + g.label + '</strong><br>' + r.label + (r.nfe ? ' · ' + r.nfe + ' NFE' : '') + '<br>top-1 ' + pm(v) + '%', e);
            });
            hit.addEventListener('mouseleave', function () { tip.hide(); });
            if (fade) requestAnimationFrame(function () { requestAnimationFrame(function () { gEl.style.opacity = 1; }); });
            summary.push(g.label + ', ' + r.label + ': ' + v[0].toFixed(1));
            y += rowH;
          });
        });
        if (refV != null) el('line', { class: 'ref-line', x1: X(refV), x2: X(refV), y1: top - 6, y2: H }, svg);
        el('title', {}, svg).textContent = view.label + ', top-1 accuracy (%): ' + summary.join('; ');
        sub.textContent = view.sub;
        insight.textContent = view.insight;
        table.innerHTML = '<thead><tr><th>Group</th><th>Sampler</th>' + (spec.groups[0].rows[0].nfe ? '<th>NFE</th>' : '') +
          '<th>Top-1 (%)</th></tr></thead><tbody>' +
          spec.groups.map(function (g) {
            return g.rows.filter(function (r) { return r.v[view.id]; }).map(function (r) {
              return '<tr><td>' + g.label + '</td><td>' + r.label + '</td>' + (spec.groups[0].rows[0].nfe ? '<td>' + (r.nfe || '') + '</td>' : '') +
                '<td>' + pm(r.v[view.id]) + '</td></tr>';
            }).join('');
          }).join('') + '</tbody>';
      }
      draw();
    };
  }

  // ------------------------------------------------------------- cost scatter
  function cost(card, W) {
    var narrow = W < 560;
    var left = 44, right = narrow ? 16 : 24, top = 14, bottom = 44, H = narrow ? 320 : 360;
    var state = card._state || (card._state = { fam: 'klein' });
    var tip = tooltip(card);
    chips(card, 'Family', COST.map(function (f) { return { id: f.id, label: f.label }; }), state.fam,
      function (id) { state.fam = id; draw(); });
    var svg = el('svg', { class: 'viz-svg', role: 'img' }, card);
    legend(card, ['released', 'basefirst', 'ours', 'base', 'guided']);
    var insight = html('div', 'viz-insight', null, card);
    insight.setAttribute('aria-live', 'polite');
    html('div', 'viz-note', 'Mean ± SD over three classifier seeds (ours: three adapter runs × three seeds). Measured on one H100 at the recorded batch sizes; excludes model loading and writing images. One-time adapter preparation is not included here.', card);
    var details = html('details', 'viz-table-toggle', null, card);
    html('summary', null, 'Show as a table', details);
    var table = html('table', 'table is-narrow is-striped', null, details);

    function draw() {
      var fam = COST.filter(function (f) { return f.id === state.fam; })[0];
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var xs = fam.points.map(function (p) { return p[4]; });
      var lo = Math.log10(Math.min.apply(null, xs) / 1.35), hi = Math.log10(Math.max.apply(null, xs) * 1.35);
      function X(s) { return left + (Math.log10(s) - lo) / (hi - lo) * (W - left - right); }
      function Y(v) { return top + (1 - v / 55) * (H - top - bottom); }
      [0, 10, 20, 30, 40, 50].forEach(function (v) {
        el('line', { class: v === 0 ? 'zero-line' : 'grid-line', x1: left, x2: W - right, y1: Y(v), y2: Y(v) }, svg);
        el('text', { class: 'tick-label', x: left - 8, y: Y(v) + 4, 'text-anchor': 'end' }, svg).textContent = v;
      });
      [0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 3, 5].filter(function (s) {
        var l = Math.log10(s); return l >= lo && l <= hi;
      }).forEach(function (s) {
        el('line', { class: 'grid-line', x1: X(s), x2: X(s), y1: top, y2: H - bottom }, svg);
        el('text', { class: 'tick-label', x: X(s), y: H - bottom + 16, 'text-anchor': 'middle' }, svg).textContent = s;
      });
      el('text', { class: 'tick-label', x: (left + W - right) / 2, y: H - 6, 'text-anchor': 'middle' }, svg).textContent = 'seconds per image (log scale)';
      el('text', { class: 'tick-label', x: 12, y: (top + H - bottom) / 2, 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (top + H - bottom) / 2 + ')' }, svg).textContent = 'top-1 (%)';
      var basePts = fam.points.filter(function (p) { return p[1] === 'base'; });
      if (basePts.length > 1) el('path', { class: 'base-path', d: basePts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[4]) + ' ' + Y(p[2]); }).join(' ') }, svg);
      fam.points.forEach(function (p) {
        var cx = X(p[4]), cy = Y(p[2]), c = ROLE[p[1]].color;
        if (p[3] > 0.05) el('line', { class: 'whisker', x1: cx, x2: cx, y1: Y(p[2] - p[3]), y2: Y(p[2] + p[3]) }, svg);
        var dot = el('circle', { cx: cx, cy: cy, r: p[1] === 'ours' ? 8 : 6, fill: c, stroke: '#ffffff', 'stroke-width': 2 }, svg);
        // unguided-base points sit on a rising line, so their labels go below it;
        // on a phone they shrink to the step count, which the legend explains
        var isBase = p[1] === 'base' || (narrow && p[1] === 'basefirst');
        var label = isBase ? (narrow ? p[0].replace(/^.*, /, '') : p[0]) :
          narrow ? p[0].replace('Released student', 'Released').replace(', default guidance', ', guided') : p[0] + ' (' + p[5] + ' NFE)';
        var onRight = cx < W - right - (narrow ? 70 : 150);
        el('text', { class: 'point-label', x: isBase ? cx : cx + (onRight ? 12 : -12), y: cy + (isBase ? 22 : 4),
          'text-anchor': isBase ? 'middle' : onRight ? 'start' : 'end',
          style: 'fill:' + (p[1] === 'guided' ? '#5b8fd0' : c) + (p[1] === 'ours' ? ';font-weight:700' : '') }, svg).textContent = label;
        var hit = el('circle', { class: 'hit', cx: cx, cy: cy, r: 16 }, svg);
        hit.addEventListener('mousemove', function (e) {
          tip.show('<strong>' + fam.label + '</strong><br>' + p[0] + ' · ' + p[5] + ' NFE<br>top-1 ' + p[2].toFixed(1) + ' ± ' + p[3].toFixed(1) + '%<br>' + secs(p[4]) + ' s per image', e);
          dot.setAttribute('r', p[1] === 'ours' ? 10 : 8);
        });
        hit.addEventListener('mouseleave', function () { tip.hide(); dot.setAttribute('r', p[1] === 'ours' ? 8 : 6); });
      });
      el('title', {}, svg).textContent = fam.label + ': ' + fam.points.map(function (p) { return p[0] + ' ' + p[2].toFixed(1) + '% at ' + secs(p[4]) + ' s'; }).join('; ');
      insight.textContent = fam.insight;
      table.innerHTML = '<thead><tr><th>Sampler</th><th>NFE</th><th>s / image</th><th>Top-1 (%)</th></tr></thead><tbody>' +
        fam.points.map(function (p) {
          return '<tr><td>' + p[0] + '</td><td>' + p[5] + '</td><td>' + secs(p[4]) + '</td><td>' + p[2].toFixed(1) + ' ± ' + p[3].toFixed(1) + '</td></tr>';
        }).join('') + '</tbody>';
    }
    draw();
  }

  // Drawn in CSS pixels at the card's width so text keeps its size on a phone;
  // a resize redraws with the same selection.
  function mount(card, chart) {
    var head = Array.prototype.slice.call(card.children, 0, 2), drawn = 0, timer = null;
    function render() {
      var cs = getComputedStyle(card);
      var w = Math.floor(card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      if (Math.abs(w - drawn) < 2) return;
      drawn = w;
      Array.prototype.slice.call(card.children).forEach(function (n) { if (head.indexOf(n) < 0) card.removeChild(n); });
      chart(card, Math.max(280, w));
    }
    render();
    // Watch the card itself, not the window: a layout change without a window
    // resize (a viewport switch, a font load, a scrollbar) must redraw too.
    if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(timer); timer = setTimeout(render, 100); }).observe(card);
    else window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(render, 150); });
  }

  function init() {
    var pairs = [['fig-main', bars(MAIN)], ['fig-cost', cost], ['fig-ablation', bars(ABLATION)], ['fig-finegrained', bars(FINEGRAINED)]];
    pairs.forEach(function (p) { var card = document.getElementById(p[0]); if (card) mount(card, p[1]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
