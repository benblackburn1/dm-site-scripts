/*! dm-experience.js v1.1.0 | Dearing & Muse site experience layer | Origin
 *  Loaded site-wide from the Webflow footer custom code (jsDelivr @commit + SRI).
 *  Modules: 1 loader, 2 home showroom rotation, 3 nav shade, 4 arrow scrollers, 5 nav drop-in + card hover.
 *  Every module checks prefers-reduced-motion and degrades to the end state.
 *  Styling it injects stays minimal and uses the site's own variables.
 */
(function () {
  'use strict';
  if (window.__dmExperience) return;
  window.__dmExperience = '1.1.0';

  var EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CDN = 'https://cdn.prod.website-files.com/6ab567aafc549c14eb780d59/';

  var CONFIG = {
    loader: {
      // Fill from Website/Content/DM_Load once uploaded as Webflow assets. First entry = cover.
      images: [],
      interval: 1000,       // ms per image, hard cut
      exit: 700,            // ms wipe
      sessionKey: 'dm-loaded'
    },
    showroom: {
      interval: 3000,
      fade: 600,
      items: [
        { name: 'Textiles',      image: CDN + '6ab58422df6f5d9eeca146b8_DM.V2-3.jpg',   cta: 'Browse textiles',      query: 'Textiles' },
        { name: 'Wallcoverings', image: CDN + '6ab58424df6f5d9eeca1476f_DM.V2-36.jpg',  cta: 'Browse wallcoverings', query: 'Wallcoverings' },
        { name: 'Furniture',     image: CDN + '6ab584b422cd6c4faae53a20_DM.V2-41.jpg',  cta: 'Browse furniture',     query: 'Furniture' }
      ],
      // Finsweet showquery format, read off a real filter click on staging. {value} is replaced.
      linkTemplate: '/represented-lines?category={value}'
    },
    shade: { opacity: 0.35, inMs: 300, outMs: 200 },
    scrollers: [
      { arrows: '.sr-cats-arrows',    track: '.sr-cards',         item: '.sr-card' },
      { arrows: '.cm-journal-arrows', track: '.cm-journal-items', item: '.w-dyn-item' }
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

  /* ---------------------------------------------------------------- 1. Loader */
  function loader() {
    var c = CONFIG.loader;
    var seen = false;
    try { seen = !!sessionStorage.getItem(c.sessionKey); } catch (e) {}
    if (seen || !c.images.length) {
      var stale = document.querySelector('.dm-loader');
      if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
      document.documentElement.classList.remove('dm-loading');
      return;
    }
    try { sessionStorage.setItem(c.sessionKey, '1'); } catch (e) {}

    css('.dm-loader{position:fixed;inset:0;z-index:9999;background:var(--_dearing-brand---color--boxwood-green,#56581a);display:flex;align-items:center;justify-content:center;overflow:hidden;transition:transform ' + c.exit + 'ms ' + EASE + ',opacity 300ms ease}' +
        '.dm-loader img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}' +
        '.dm-loader img.is-on{opacity:1}' +
        '.dm-loader.is-out{transform:translateY(-100%)}' +
        '.dm-loader.is-fade{opacity:0}' +
        'html.dm-loading{overflow:hidden}');

    // The site head paints an empty .dm-loader before first paint; adopt it if present.
    var wrap = document.querySelector('.dm-loader') || document.createElement('div');
    wrap.className = 'dm-loader';
    wrap.setAttribute('aria-hidden', 'true');
    var imgs = c.images.map(function (src, i) {
      var im = document.createElement('img');
      im.src = src; im.alt = ''; im.decoding = 'sync';
      if (i === 0) im.className = 'is-on';
      wrap.appendChild(im);
      return im;
    });
    document.documentElement.classList.add('dm-loading');
    if (!wrap.parentNode) (document.body || document.documentElement).appendChild(wrap);

    var idx = 0, cycled = false, loaded = false, timer;
    function finish() {
      clearInterval(timer);
      wrap.classList.add(REDUCED ? 'is-fade' : 'is-out');
      document.documentElement.classList.remove('dm-loading');
      document.dispatchEvent(new CustomEvent('dm:loader-done'));
      setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, c.exit + 50);
    }
    function maybeFinish() { if (cycled && loaded) finish(); }

    if (REDUCED) {
      setTimeout(function () { cycled = true; maybeFinish(); }, 600);
    } else {
      timer = setInterval(function () {
        imgs[idx].classList.remove('is-on');
        idx = (idx + 1) % imgs.length;
        imgs[idx].classList.add('is-on');
        if (idx === 0) { cycled = true; maybeFinish(); }
      }, c.interval);
    }
    if (document.readyState === 'complete') { loaded = true; }
    else window.addEventListener('load', function () { loaded = true; maybeFinish(); });
    // Safety: never hold the page longer than 8s.
    setTimeout(function () { cycled = true; loaded = true; finish(); }, 8000);
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

  /* ----------------------------------------------------------- 3. Nav shade */
  function navShade() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var cfg = CONFIG.shade;
    css('.dm-shade{position:fixed;left:0;right:0;bottom:0;top:0;background:#000;opacity:0;pointer-events:none;z-index:900;transition:opacity ' + cfg.outMs + 'ms ease}' +
        '.dm-shade.is-on{opacity:' + cfg.opacity + ';pointer-events:auto;transition-duration:' + cfg.inMs + 'ms}' +
        '.nav{position:relative;z-index:950}' +
        '.announce-bar{position:relative;z-index:950}');
    var shade = document.createElement('div');
    shade.className = 'dm-shade';
    document.body.appendChild(shade);
    function sync() {
      var open = nav.querySelector('.w-dropdown-toggle.w--open');
      shade.classList.toggle('is-on', !!open);
      // Keep the shade under the bar: start it at the bottom edge of the nav.
      var r = nav.getBoundingClientRect();
      shade.style.top = Math.max(0, r.bottom) + 'px';
    }
    var mo = new MutationObserver(sync);
    mo.observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
    window.addEventListener('scroll', function () { if (shade.classList.contains('is-on')) sync(); }, { passive: true });
    // A click on the shade is an outside click, which Webflow uses to close the dropdown.
  }

  /* ------------------------------------------------------ 4. Arrow scrollers */
  function scrollers() {
    css('.dm-arrow{cursor:pointer;display:inline-block;padding:0 6px;user-select:none;transition:opacity 300ms ' + EASE + ',transform 300ms ' + EASE + '}' +
        '.dm-arrow.is-end{opacity:.35;cursor:default}' +
        '.dm-arrow:not(.is-end):hover{transform:translateX(var(--dm-nudge,0))}' +
        '.sr-cards::-webkit-scrollbar,.cm-journal-items::-webkit-scrollbar{display:none}' +
        '.cm-journal-items .w-dyn-item{flex:0 0 calc((100% - 30px) / 3);scroll-snap-align:start}' +
        '@media (max-width:767px){.cm-journal-items .w-dyn-item{flex-basis:78%}}');
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

  loader();
  onReady(function () {
    showroom();
    navShade();
    scrollers();
    smallMotion();
  });
})();
