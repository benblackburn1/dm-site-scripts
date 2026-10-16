/*! dm-experience.js v1.8.0 | Dearing & Muse site experience layer | Origin
 *  Loaded site-wide from the Webflow footer custom code (jsDelivr @commit + SRI).
 *  Modules: 1 loader, 2 home showroom rotation, 3 nav panel + shade + hover, 4 arrow scrollers, 5 nav drop-in +
 *  card hover, 6 event RSVP modal, 7 button inversion.
 *  Every module checks prefers-reduced-motion and degrades to the end state.
 *  Styling it injects stays minimal and uses the site's own variables.
 */
(function () {
  'use strict';
  if (window.__dmExperience) return;
  window.__dmExperience = '1.8.0';

  var EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CDN = 'https://cdn.prod.website-files.com/6ab567aafc549c14eb780d59/';


    showroom: {
      interval: 3000,
      fade: 600,
      items: [
        { name: 'Textiles',      image: CDN + '6ab58422df6f5d9eeca146b8_DM.V2-3.jpg',   cta: 'Browse textiles',      query: 'Textiles' },
        { name: 'Wallcoverings', image: CDN + '6ab58424df6f5d9eeca1476f_DM.V2-36.jpg',  cta: 'Browse wallcoverings', query: 'Wallcoverings' },
        { name: 'Furniture',     image: CDN + '6ab584b422cd6c4faae53a20_DM.V2-41.avif',  cta: 'Browse furniture',     query: 'Furniture' }
      ],
      // Finsweet showquery format, read off a real filter click on staging. {value} is replaced.
      linkTemplate: '/represented-lines?category={value}'
    },
    shade: { opacity: 0.35, inMs: 300, outMs: 200, panelMs: 600, panelPad: 14, leaveMs: 200 },
    scrollers: [
      { arrows: '.cm-journal-arrows', track: '.cm-journal-items', item: '.w-dyn-item' },
      // Event lists (Showroom + Community): one card per event, scrolling sideways.
      { arrows: '.sr-events .events-arrows', track: '.sr-events .event-list .w-dyn-items', item: '.w-dyn-item' },
      { arrows: '.cm-events .events-arrows', track: '.cm-events .event-list .w-dyn-items', item: '.w-dyn-item' }
    ]
  };

  function css(text) {
    var s = document.createElement('style');
    s.setAttribute('data-dm', '');
    s.textContent = text;
    (document.head || document.documentElement).appendChild(s);
  }
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }


  /* --------------------------------------------- 2. Home showroom rotation */
  function showroom() {
    var list = document.querySelector('.showroom-list');
    var media = document.querySelector('.showroom-media');
    var cta = document.querySelector('.showroom-cta');
    if (!list || !media || !cta) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.showroom-item'));
    var cfg = CONFIG.showroom;
    if (items.length < 2) return;

    css('.showroom-item{cursor:pointer;transition:opacity 300ms ' + EASE + '}' +
        '.showroom-item-copy,.showroom-cta{transition:opacity 300ms ' + EASE + ',transform 300ms ' + EASE + '}' +
        '.showroom-item.is-dim .showroom-item-copy{display:none}' +
        '.showroom-media img.dm-fade{transition:opacity ' + cfg.fade + 'ms ' + EASE + '}' +
        '.dm-pop{opacity:0;transform:translateY(-8px)}');

    var img = media.querySelector('img');
    if (img) img.classList.add('dm-fade');
    cfg.items.forEach(function (it) { var p = new Image(); p.src = it.image; });

    var current = 0, timer, paused = false;
    function pop(el) {
      if (!el || REDUCED) return;
      el.classList.add('dm-pop');
      void el.offsetWidth;
      el.classList.remove('dm-pop');
    }
    function go(n, user) {
      current = (n + items.length) % items.length;
      var it = cfg.items[current] || {};
      items.forEach(function (el, i) { el.classList.toggle('is-dim', i !== current); });
      pop(items[current].querySelector('.showroom-item-copy'));
      if (it.cta) {
        cta.textContent = it.cta;
        cta.setAttribute('href', cfg.linkTemplate.replace('{value}', encodeURIComponent(it.query)));
        pop(cta);
      }
      if (img && it.image && img.getAttribute('src') !== it.image) {
        if (REDUCED) { swap(); } else {
          img.style.opacity = '0';
          setTimeout(swap, cfg.fade / 2);
        }
      }
      function swap() {
        img.removeAttribute('srcset'); img.removeAttribute('sizes');
        img.src = it.image;
        img.style.opacity = '1';
      }
      if (user) restart();
    }
    function tick() { if (!paused) go(current + 1); }
    function restart() {
      clearInterval(timer);
      if (REDUCED) return;
      var ms = window.innerWidth < 768 ? cfg.interval + 1000 : cfg.interval;
      timer = setInterval(tick, ms);
    }
    items.forEach(function (el, i) {
      el.addEventListener('click', function () { go(i, true); });
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i, true); } });
    });
    var section = list.closest('section') || list;
    section.addEventListener('mouseenter', function () { paused = true; });
    section.addEventListener('mouseleave', function () { paused = false; });
    section.addEventListener('focusin', function () { paused = true; });
    section.addEventListener('focusout', function () { paused = false; });
    document.addEventListener('visibilitychange', function () { paused = document.hidden; });

    go(0);
    restart();
  }

  /* ---------------------------------------------------- 3. Nav panel + shade */
  // When a desktop dropdown opens, the bar's lower edge (its background and bottom rule) eases
  // down under the open links, so they sit on the nav colour, and the page below is dimmed.
  // The mobile Menu keeps its own full-width list. Home's transparent nav turns Longleaf while
  // open so ivory links read on it.
  function navShade() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var cfg = CONFIG.shade;
    var ms = REDUCED ? 0 : cfg.panelMs;
    css('.dm-shade{position:fixed;left:0;right:0;bottom:0;top:0;background:#000;opacity:0;pointer-events:none;z-index:900;transition:opacity ' + cfg.outMs + 'ms ease,top ' + ms + 'ms ' + EASE + '}' +
        '.dm-shade.is-on{opacity:' + cfg.opacity + ';pointer-events:auto;transition-duration:' + cfg.inMs + 'ms,' + ms + 'ms}' +
        '.nav{position:relative;z-index:950;transition:background-color ' + ms + 'ms ' + EASE + '}' +
        '.announce-bar{position:relative;z-index:950}' +
        // Sits over the nav's own bottom rule (top:100% = the padding box edge) and carries the
        // same background and rule, so growing it reads as the bar's edge moving down.
        '.dm-nav-panel{position:absolute;left:0;right:0;top:100%;height:0;background-color:inherit;border-bottom:1px solid;border-bottom-color:inherit;z-index:0;transition:height ' + ms + 'ms ' + EASE + '}' +
        '.nav.dm-nav-open.dm-nav-clear{background-color:var(--_dearing-brand---color--longleaf-green,#24322b)}');
    var panel = document.createElement('div');
    panel.className = 'dm-nav-panel';
    panel.setAttribute('aria-hidden', 'true');
    nav.appendChild(panel);
    var shade = document.createElement('div');
    shade.className = 'dm-shade';
    document.body.appendChild(shade);
    if (/^(transparent|rgba\([^)]*,\s*0\s*\))$/.test(getComputedStyle(nav).backgroundColor)) nav.classList.add('dm-nav-clear');
    function sync() {
      var toggle = nav.querySelector('.w-dropdown-toggle.w--open');
      var dd = toggle && toggle.closest('.w-dropdown');
      var list = dd && !dd.classList.contains('nav-dd-mobile') ? dd.querySelector('.w-dropdown-list.w--open') : null;
      var r = nav.getBoundingClientRect();
      var bw = parseFloat(getComputedStyle(nav).borderBottomWidth) || 0;
      var height = list ? Math.max(0, Math.round(list.getBoundingClientRect().bottom - r.bottom + cfg.panelPad)) : 0;
      nav.classList.toggle('dm-nav-open', !!toggle);
      panel.style.height = height + 'px';
      shade.classList.toggle('is-on', !!toggle);
      // Keep the shade under the bar and its panel. The panel starts on the bar's own rule
      // (top:100% is the padding-box edge) and its height includes its rule, so its bottom is
      // r.bottom - bw + height; start the shade 2px above that, hidden under the panel, so no
      // sub-pixel seam shows between the rule and the dimmed page.
      shade.style.top = Math.max(0, Math.floor(r.bottom - bw + height) - 2) + 'px';
    }
    var mo = new MutationObserver(sync);
    mo.observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
    window.addEventListener('scroll', function () { if (shade.classList.contains('is-on')) sync(); }, { passive: true });
    window.addEventListener('resize', function () { if (shade.classList.contains('is-on')) sync(); });
    // A click on the shade is an outside click, which Webflow uses to close the dropdown.

    // Hover (mouse and trackpad only): a dropdown opens when its toggle is hovered and stays
    // open while the cursor is anywhere on the bar or its panel; it closes only when the cursor
    // leaves the whole grown bar. Webflow's own hover mode would close it on leaving the
    // dropdown wrapper, so the dropdowns stay in click mode and are driven here through the
    // events Webflow listens to: mouseup on the toggle opens (and closes the other dropdown),
    // and w-close on the wrapper closes. Touch devices keep tap to open.
    if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    var dds = [].slice.call(nav.querySelectorAll('.nav-dd.w-dropdown:not(.nav-dd-mobile)'));
    var leaveTimer = 0;
    function isOpen(dd) { return !!dd.querySelector('.w-dropdown-toggle.w--open'); }
    function press(el) {
      ['mousedown', 'mouseup'].forEach(function (type) {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 }));
      });
    }
    function closeAll() {
      dds.forEach(function (dd) { if (isOpen(dd)) dd.dispatchEvent(new Event('w-close')); });
    }
    dds.forEach(function (dd) {
      var t = dd.querySelector('.w-dropdown-toggle');
      if (!t) return;
      t.addEventListener('mouseenter', function () {
        clearTimeout(leaveTimer);
        if (!isOpen(dd)) press(t);
      });
    });
    nav.addEventListener('mouseenter', function () { clearTimeout(leaveTimer); });
    nav.addEventListener('mouseleave', function () {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(function () { if (!nav.matches(':hover')) closeAll(); }, cfg.leaveMs);
    });
  }

  /* ------------------------------------------------------ 4. Arrow scrollers */
  function scrollers() {
    css('.dm-arrow{cursor:pointer;display:inline-block;padding:0 6px;user-select:none;transition:opacity 300ms ' + EASE + ',transform 300ms ' + EASE + '}' +
        '.dm-arrow.is-end{opacity:.35;cursor:default}' +
        '.dm-arrow:not(.is-end):hover{transform:translateX(var(--dm-nudge,0))}' +
        '.sr-cards::-webkit-scrollbar,.cm-journal-items::-webkit-scrollbar{display:none}' +
        '.cm-journal-items .w-dyn-item{flex:0 0 calc((100% - 30px) / 3);scroll-snap-align:start}' +
        '@media (max-width:767px){.cm-journal-items .w-dyn-item{flex-basis:78%}}' +
        // Event track: same rhythm as the journal row (3 up, 2 on tablet, 78% on phones).
        '.event-list .w-dyn-items{display:flex;column-gap:15px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}' +
        '.event-list .w-dyn-items::-webkit-scrollbar{display:none}' +
        '.event-list .w-dyn-item{flex:0 0 calc((100% - 30px) / 3);scroll-snap-align:start;display:flex}' +
        '.event-list .w-dyn-item > .event-item{flex:1 1 auto}' +
        '@media (max-width:991px){.event-list .w-dyn-item{flex-basis:calc((100% - 15px) / 2)}}' +
        '@media (max-width:767px){.event-list .w-dyn-item{flex-basis:78%}}');
    CONFIG.scrollers.forEach(function (s) {
      var arrows = document.querySelector(s.arrows);
      var track = document.querySelector(s.track);
      if (!arrows || !track) return;
      arrows.innerHTML = '';
      var prev = document.createElement('span'); prev.className = 'dm-arrow dm-prev'; prev.textContent = '←'; prev.style.setProperty('--dm-nudge', '-4px');
      var next = document.createElement('span'); next.className = 'dm-arrow dm-next'; next.textContent = '→'; next.style.setProperty('--dm-nudge', '4px');
      prev.setAttribute('role', 'button'); next.setAttribute('role', 'button');
      prev.setAttribute('aria-label', 'Previous'); next.setAttribute('aria-label', 'Next');
      prev.tabIndex = 0; next.tabIndex = 0;
      arrows.appendChild(prev); arrows.appendChild(document.createTextNode('   ')); arrows.appendChild(next);

      function step() {
        var first = track.querySelector(s.item);
        if (!first) return 300;
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '15') || 15;
        return first.getBoundingClientRect().width + gap;
      }
      function ends() {
        var max = track.scrollWidth - track.clientWidth - 1;
        prev.classList.toggle('is-end', track.scrollLeft <= 1);
        next.classList.toggle('is-end', track.scrollLeft >= max);
      }
      function to(target) {
        var max = track.scrollWidth - track.clientWidth;
        target = Math.max(0, Math.min(max, target));
        if (REDUCED) { track.scrollLeft = target; ends(); return; }
        // Background tabs get no animation frames; let the browser ease instead.
        if (document.hidden) { track.scrollTo({ left: target, behavior: 'smooth' }); setTimeout(ends, 700); return; }
        var from = track.scrollLeft, delta = target - from, t0 = null, D = 600;
        track.style.scrollSnapType = 'none';
        function frame(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / D);
          var e = 1 - Math.pow(1 - p, 3); // ease-out cubic
          track.scrollLeft = from + delta * e;
          if (p < 1) requestAnimationFrame(frame);
          else { track.style.scrollSnapType = ''; ends(); }
        }
        requestAnimationFrame(frame);
      }
      prev.addEventListener('click', function () { to(track.scrollLeft - step()); });
      next.addEventListener('click', function () { to(track.scrollLeft + step()); });
      [prev, next].forEach(function (b) { b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } }); });
      track.addEventListener('scroll', ends, { passive: true });
      window.addEventListener('resize', ends);
      ends();
    });
  }

  /* --------------------------------------- 5. Nav drop-in + card image hover */
  function smallMotion() {
    if (REDUCED) return;
    css('@keyframes dmDrop{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}' +
        '.nav .w-dropdown-list.w--open .nav-dd-link,.nav .w-dropdown-list.w--open a{animation:dmDrop 300ms ' + EASE + ' both}' +
        '.nav .w-dropdown-list.w--open a:nth-child(2){animation-delay:60ms}' +
        '.nav .w-dropdown-list.w--open a:nth-child(3){animation-delay:120ms}' +
        '.nav .w-dropdown-list.w--open a:nth-child(4){animation-delay:180ms}' +
        '.nav .w-dropdown-list.w--open a:nth-child(5){animation-delay:240ms}' +
        '@media (hover:hover){' +
          '.post-card .img-cover,.line-card .img-cover,.ct-card .img-cover,.sr-card .img-cover{transition:transform 600ms ' + EASE + '}' +
          '.post-card:hover .img-cover,.line-card:hover .img-cover,.ct-card:hover .img-cover,.sr-card:hover .img-cover{transform:scale(1.03)}' +
          '.post-card-media,.sr-card-media{overflow:hidden}' +
        '}');
  }

  /* --------------------------------------- 6. Event RSVP modal */
  // Any "→ RSVP" link (.event-rsvp) opens the RSVP Modal component instead of the mailto,
  // with the event's name and date filled in. Closes on Close, the backdrop or Escape.
  function rsvpModal() {
    var modal = document.querySelector('.rsvp-modal');
    if (!modal) return;
    var title = modal.querySelector('.rsvp-title');
    var when = modal.querySelector('.rsvp-when');
    var field = modal.querySelector('#rsvp-event');
    var form = modal.querySelector('form');
    var done = modal.querySelector('.w-form-done');
    var fail = modal.querySelector('.w-form-fail');
    var trigger = null;
    if (field) field.readOnly = true;
    function text(root, sel) { var el = root && root.querySelector(sel); return el ? el.textContent.trim() : ''; }
    function open(name, date) {
      if (form && done && getComputedStyle(done).display !== 'none') {
        form.reset(); form.style.display = ''; done.style.display = 'none';
        if (fail) fail.style.display = 'none';
      }
      if (title) title.textContent = name || 'RSVP';
      if (when) when.textContent = date;
      if (field) field.value = date ? name + ' (' + date + ')' : name;
      modal.style.display = 'flex';
      document.documentElement.style.overflow = 'hidden';
      var first = modal.querySelector('#rsvp-name');
      if (first) first.focus();
    }
    function close() {
      modal.style.display = 'none';
      document.documentElement.style.overflow = '';
      if (trigger) trigger.focus();
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.event-rsvp');
      if (!a) return;
      e.preventDefault();
      trigger = a;
      var item = a.closest('.event-item');
      open(text(item, '.event-name'), text(item, '.event-when'));
    });
    var backdrop = modal.querySelector('.rsvp-backdrop');
    if (backdrop) backdrop.addEventListener('click', close);
    var x = modal.querySelector('.rsvp-close');
    if (x) x.addEventListener('click', function (e) { e.preventDefault(); close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.style.display === 'flex') close(); });
  }

  /* ------------------------------------------------------- 7. Button inversion */
  // Buttons reverse on hover against the surface they sit on: an outlined button fills with the
  // surface's ink colour and its text takes the surface colour; a solid (Boxwood) button empties
  // to the surface colour with Boxwood text and rule. Each section class declares its ink and
  // surface here; nested elements inherit them, so a button anywhere inside a section is covered.
  // The Home hero sits on a photo, so it borrows Longleaf as its surface.
  function buttons() {
    var C = 'var(--_dearing-brand---color--';
    var ivory = C + 'ivory)', fog = C + 'fog-green)', boxwood = C + 'boxwood-green)',
        longleaf = C + 'longleaf-green)', pistachio = C + 'pistachio-green)', aubergine = C + 'aubrergine)';
    function surface(sel, ink, bg) { return sel + '{--dm-ink:' + ink + ';--dm-surface:' + bg + '}'; }
    css(surface(':root', boxwood, ivory) +
        surface('.sec-ivory', boxwood, ivory) +
        surface('.sec-ivory-longleaf', longleaf, ivory) +
        surface('.sec-fog', boxwood, fog) +
        surface('.sec-fog-longleaf', longleaf, fog) +
        surface('.sec-pistachio', longleaf, pistachio) +
        surface('.sec-pistachio-boxwood', boxwood, pistachio) +
        surface('.sec-longleaf', pistachio, longleaf) +
        surface('.sec-aubergine', ivory, aubergine) +
        surface('.footer', ivory, longleaf) +
        surface('.hero', ivory, longleaf) +
        surface('.rsvp-panel', longleaf, ivory) +
        '.btn-outline:hover{background-color:var(--dm-ink);border-color:var(--dm-ink);color:var(--dm-surface)}' +
        '.btn-solid:hover{background-color:var(--dm-surface);border-color:' + boxwood + ';color:' + boxwood + '}');
  }

  loader();
  onReady(function () {
    showroom();
    navShade();
    scrollers();
    smallMotion();
    rsvpModal();
    buttons();
  });
})();
