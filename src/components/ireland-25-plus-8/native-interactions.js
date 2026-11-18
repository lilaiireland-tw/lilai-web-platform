// Native interactions retained from the supplied production HTML.
import { ireland25Plus8Video } from '@/content/ireland-25-plus-8-copy';
import { readConsentCookie } from '@/lib/analytics/consent';

/* 哩來 25+8｜頁面互動與追蹤（原生 JS，無框架、無外部套件）。沿用網站既有 GTM/GA4，本檔不安裝追蹤碼。 */
export function initialize(root){
  'use strict';
  var listeners = [], observers = [], timers = [];
  function on(target, event, handler, options){
    target.addEventListener(event, handler, options);
    listeners.push([target, event, handler, options]);
  }
  function observe(handler, options){ var observer = new IntersectionObserver(handler, options); observers.push(observer); return observer; }
  function later(handler, delay){ var timer = setTimeout(handler, delay); timers.push(timer); return timer; }
  var CTA = '/consult';
  var push = function(o){
    if (!readConsentCookie(document.cookie)?.analytics) return;
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ page_type: 'pillar_25plus8' }, o)); } catch { /* Tracking must not interrupt navigation. */ }
  };
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;
  var $ = function(s, r){ return (r || root).querySelector(s); };
  var $$ = function(s, r){ return [].slice.call((r || root).querySelectorAll(s)); };

  // ── 分頁（制度時間軸、方案比較）──
  $$('[role="tablist"]').forEach(function(list){
    var tabs = $$('[role="tab"]', list);
    function select(i, focus){
      tabs.forEach(function(t, k){ var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; var p = document.getElementById(t.getAttribute('aria-controls')); if (p && p.getAttribute('role') === 'tabpanel') p.hidden = !on; else if (p && on) p.setAttribute('data-active', String(i)); });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function(t, i){ on(t, 'click', function(){ select(i); }); });
    on(list, 'keydown', function(e){ var i = tabs.indexOf(document.activeElement); if (i < 0) return; var n = tabs.length; var k = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key]; if (k === undefined) return; e.preventDefault(); select(k, true); });
  });

  // ── 學弟妹故事（手動切換，不自動輪播）──
  $$('[data-car]').forEach(function(track){
    var sec = track.closest('section'), label = sec && $('[aria-live]', sec), prev = sec && $('[data-car-prev]', sec), next = sec && $('[data-car-next]', sec), i = 0;
    var n = function(){ return track.children.length; };
    var pad = function(x){ return (x < 10 ? '0' : '') + x; };
    function upd(){
      if (label) label.textContent = pad(i + 1) + ' / ' + pad(Math.max(n(), 1));
      if (prev) prev.disabled = i <= 0; if (next) next.disabled = i >= n() - 1;
      [].forEach.call(track.children, function(c, k){ c.setAttribute('data-active', String(k === i)); });
    }
    function go(d){ i = Math.max(0, Math.min(n() - 1, i + d)); var c = track.children[i]; if (c) track.scrollTo({ left: c.offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); upd(); }
    if (prev) on(prev, 'click', function(){ go(-1); });
    if (next) on(next, 'click', function(){ go(1); });
    on(track, 'keydown', function(e){ if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    on(track, 'scroll', function(){ var c = track.children[0]; if (!c) return; var k = Math.round(track.scrollLeft / (c.offsetWidth + 24)); if (k !== i) { i = k; upd(); } }, { passive: true });
    upd();
  });

  // ── 錨點捲動（扣掉 Sticky Header 高度）＋語校卡短暫高亮 ──
  var flashT;
  function scrollToId(id, flash){
    var el = document.getElementById(id); if (!el) return;
    var hd = document.querySelector('body > header');
    var off = (hd ? hd.getBoundingClientRect().bottom : 0) + 20;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? 'auto' : 'smooth' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    if (flash) { el.removeAttribute('data-flash'); void el.offsetWidth; el.setAttribute('data-flash', '1'); clearTimeout(flashT); flashT = later(function(){ el.removeAttribute('data-flash'); }, 1800); }
  }

  // ── 閱讀旅程（桌面右側進度點＋手機 Sticky CTA 上方進度條）──
  var STAGES = [['system'], ['budget', 'webinar', 'why-ireland', 'fit'], ['choose', 'schools'], ['why-lilai', 'stories', 'process', 'faq', 'start']];
  var rail = $('.l-jr'), railLinks = rail ? $$('.l-jr-a', rail) : [], fill = rail ? $('ol > li:nth-child(2)', rail) : null, bars = $$('.l-jm'), cur = -1, railT;
  function stageOf(id){ for (var k = 0; k < STAGES.length; k++) if (STAGES[k].indexOf(id) > -1) return k; return -1; }
  function setStage(k){
    if (k === cur) return; cur = k;
    railLinks.forEach(function(a, j){
      a.setAttribute('data-state', j < k ? 'done' : j === k ? 'current' : 'todo'); a.setAttribute('aria-current', j === k ? 'step' : 'false');
      var lb = $('.l-jr-lb', a), dot = $('.l-jr-dot', a); a.setAttribute('aria-label', (dot ? dot.textContent : '') + ' ' + (lb ? lb.textContent : '') + (j === k ? '（目前位置）' : ''));
    });
    bars.forEach(function(b, j){ b.setAttribute('data-state', j < k ? 'done' : j === k ? 'current' : 'todo'); });
    if (fill) fill.style.height = 'calc((100% - 44px) * ' + (k < 0 ? 0 : k / (STAGES.length - 1)) + ')';
    if (rail && k > -1) { rail.setAttribute('data-flash', 'true'); clearTimeout(railT); railT = later(function(){ rail.setAttribute('data-flash', 'false'); }, 2400); }
  }
  if (hasIO) {
    var sio = observe(function(es){ es.forEach(function(en){ if (en.isIntersecting) setStage(stageOf(en.target.id)); }); }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(function(s){ sio.observe(s); });
    var vis = { top: true, start: false };
    var rio = observe(function(es){ es.forEach(function(en){ vis[en.target.id] = en.isIntersecting; }); if (rail) rail.setAttribute('data-show', String(!vis.top && !vis.start)); }, { threshold: 0 });
    ['top', 'start'].forEach(function(id){ var el = document.getElementById(id); if (el) rio.observe(el); });
  }

  // ── Smart Sticky CTA（手機）：Hero／Webinar／免費諮詢／Final 任一 CTA 在畫面內就隱藏 ──
  var sticky = $('[data-sticky]');
  if (sticky && hasIO) {
    var zones = {};
    var updateSticky = function(es){
      es.forEach(function(en){ zones[en.target.getAttribute('data-cta-zone')] = en.isIntersecting; });
      var hz = $('[data-cta-zone="hero"]'), past = hz ? hz.getBoundingClientRect().bottom < 0 : true, any = false;
      for (var k in zones) if (zones[k]) any = true;
      var footer = document.querySelector('body > footer');
      var show = past && !any && !document.getElementById('lilai-cookie-title') && (!footer || footer.getBoundingClientRect().top >= window.innerHeight);
      sticky.setAttribute('data-show', show ? 'true' : 'false'); sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    };
    var zio = observe(updateSticky, { threshold: 0 });
    on(window, 'scroll', function(){ updateSticky([]); }, { passive: true });
    on(window, 'resize', function(){ updateSticky([]); });
    var consentObserver = new MutationObserver(function(){ updateSticky([]); });
    consentObserver.observe(document.body, { childList: true, subtree: true });
    observers.push(consentObserver);
    $$('[data-cta-zone]').forEach(function(z){ zio.observe(z); });
  }

  // ── 進場淡入（僅視覺；沒有 JS 或 reduced-motion 時內容直接顯示）──
  if (!reduce && hasIO) {
    root.classList.add('l-js');
    var vio = observe(function(es){ es.forEach(function(en){ if (!en.isIntersecting) return; var el = en.target; el.setAttribute('data-in', '1'); vio.unobserve(el); if (el.style.transitionDelay) later(function(){ el.style.transitionDelay = ''; }, 800); }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    var mark = function(sel, kind, stagger){ $$(sel).forEach(function(el){ if (el.hasAttribute('data-rv') || el.closest('#top') || (kind === 'img' && el.closest('.l-sch'))) return; el.setAttribute('data-rv', kind); if (stagger) { var i = [].indexOf.call(el.parentElement.children, el); if (i > 0) el.style.transitionDelay = Math.min(i, 3) * 90 + 'ms'; } vio.observe(el); }); };
    mark('main section > div > header', 'up'); mark('main .l-sec figure', 'img'); mark('#budget .l-3 > article', 'up', true); mark('#schools .l-sch', 'up', true);
    on(window, 'beforeprint', function(){ $$('[data-rv]').forEach(function(el){ el.setAttribute('data-in', '1'); }); });
  }

  // Load YouTube on request; retain source playback events and fallback.
  var V = ireland25Plus8Video, ytId = V.youtubeId;
  var vurl = 'https://www.youtube.com/shorts/' + ytId;
  var poster = 'https://i.ytimg.com/vi/' + ytId + '/hqdefault.jpg';
  var player = $('#hv-player'), fired = {}, disposed = false, prevReady, apiReady;
  function track(stage){
    if (fired[stage]) return;
    fired[stage] = true;
    push({ event: 'highlight_video_' + stage, video_title: V.title, video_provider: 'youtube', video_url: vurl });
  }
  if (player) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'l-play'; b.setAttribute('aria-label', '播放影片：' + V.title);
    b.style.cssText = 'font:inherit;position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;cursor:pointer;background:#0b3927;display:block;overflow:hidden;color:#fff';
    b.innerHTML = '<img alt="" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">' +
      '<span class="l-play-btn" aria-hidden="true" style="position:absolute;left:50%;top:50%;translate:-50% -50%;width:clamp(64px,9vw,84px);height:clamp(64px,9vw,84px);box-sizing:border-box;padding-left:4px;border-radius:999px;background:#ffbe12;color:#0b3927;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 8px rgba(11,57,39,.35)"><span style="display:inline-block;width:34px;height:34px;background:currentcolor;-webkit-mask:url(/assets/ireland-25-plus-8/icons/play.svg) center/contain no-repeat;mask:url(/assets/ireland-25-plus-8/icons/play.svg) center/contain no-repeat"></span></span>' +
      '<span aria-hidden="true" style="position:absolute;left:0;bottom:0;display:flex;align-items:center;gap:8px;padding:9px 16px;background:#0b3927;font-size:14px;font-weight:800;line-height:1.4">精華影片</span>';
    b.querySelector('img').src = poster;
    player.appendChild(b);
    var yp = null, timer = null, fellBack = false, fbT = null;
    on(b, 'click', function(){
      player.innerHTML = ''; var host = document.createElement('div'); host.style.cssText = 'position:absolute;inset:0'; var inner = document.createElement('div'); host.appendChild(inner); player.appendChild(host);
      var go = function(){
        if (fellBack || yp) return; clearTimeout(fbT);
        yp = new window.YT.Player(inner, { host: 'https://www.youtube-nocookie.com', videoId: ytId, width: '100%', height: '100%',
          playerVars: { autoplay: 1, rel: 0, playsinline: 1, cc_lang_pref: 'zh-Hant', hl: 'zh-TW' },
          events: {
            onReady: function(e){ var f = e.target.getIframe(); if (f) { f.title = V.title; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0'; f.focus(); } },
            onStateChange: function(e){
              if (e.data === 1) { track('play'); clearInterval(timer); timer = setInterval(function(){ var d = yp.getDuration(), c = yp.getCurrentTime(); if (d > 0 && c / d >= 0.5) track('50_percent'); }, 1000); }
              else clearInterval(timer);
              if (e.data === 0) track('complete');
            }
          } });
      };
      if (window.YT && window.YT.Player) { go(); return; }
      prevReady = window.onYouTubeIframeAPIReady; apiReady = function(){ if (prevReady) prevReady(); if (!disposed) go(); }; window.onYouTubeIframeAPIReady = apiReady;
      if (!document.getElementById('yt-iframe-api')) { var s = document.createElement('script'); s.id = 'yt-iframe-api'; s.src = 'https://www.youtube.com/iframe_api'; s.async = true; document.head.appendChild(s); }
      // API 6 秒內沒載入：改用一般 iframe（無法回報播放事件，因此不推送 highlight_video_play）
      fbT = later(function(){
        if (yp) return; fellBack = true; host.innerHTML = '';
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&rel=0&playsinline=1&hl=zh-TW';
        f.title = V.title; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
        f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0'; host.appendChild(f); f.focus();
        push({ event: 'highlight_video_fallback_embed', video_title: V.title });
      }, 6000);
    }, { once: true });
  }

  // ── 點擊追蹤（只記錄互動；正式 Lead 以免費出發評估表單「成功送出」為準）──
  var names = { top: 'hero', budget: 'pricing', 'why-lilai': 'services', start: 'footer' };
  var target = CTA ? new URL(CTA, location.href).href.split('#')[0] : '';
  on(document, 'click', function(e){
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || !root.contains(a)) return;
    if (a.hasAttribute('data-jump')) {
      var id = a.getAttribute('data-jump'), flash = a.getAttribute('data-flash') === '1';
      if (!document.getElementById(id)) return;
      e.preventDefault(); scrollToId(id, flash);
      push({ event: flash ? 'click_25plus8_tier_school' : 'click_25plus8_journey_nav', cta_position: flash ? 'budget_tier' : 'journey_rail', target_section: id });
      return;
    }
    if (a.hasAttribute('data-paid-consult')) { push({ event: 'click_25plus8_paid_consult', cta_position: 'consult_paid', link_url: a.href }); return; }
    if (a.hasAttribute('data-school-detail')) { push({ event: 'click_25plus8_school_detail', cta_position: 'school_card_name', school_name: a.getAttribute('data-school-detail'), link_url: a.href }); return; }
    if (!target || a.href.split('#')[0] !== target) return;
    var sec = a.closest('section[id]'), pos;
    if (a.closest('[data-sticky]')) pos = 'sticky'; else if (a.closest('[data-menu]')) pos = 'mobile_menu'; else if (a.closest('footer')) pos = 'footer_nav';
    else if (sec && sec.id === 'schools') pos = a.hasAttribute('data-school') ? 'school_card' : 'schools_other_cities'; else if (sec) pos = sec.id; else pos = 'header';
    push({ event: pos === 'school_card' ? 'click_25plus8_school_card' : pos === 'webinar' ? 'full_replay_cta_click' : 'click_25plus8_cta_' + (names[pos] || pos), cta_position: pos, link_url: a.href, cta_text: (a.textContent || '').trim().slice(0, 60), school_name: a.getAttribute('data-school') || undefined });
  }, true);

  // Keep details open while closing so its content remains visible throughout the animation.
  var faqCleanups = [];
  $$('#faq details').forEach(function(d){
    var summary = $('summary', d), expanded = d.open, animation;
    if (!reduce && d.animate) {
      on(summary, 'click', function(e){
        e.preventDefault();
        expanded = !expanded;
        var from = d.getBoundingClientRect().height;
        if (animation) animation.cancel();
        d.open = true;
        d.toggleAttribute('data-faq-closing', !expanded);
        var to = expanded ? d.getBoundingClientRect().height : summary.getBoundingClientRect().height + d.offsetHeight - d.clientHeight;
        animation = d.animate({ height: [from + 'px', to + 'px'] }, { duration: 280, easing: 'cubic-bezier(.2,.7,.3,1)' });
        animation.onfinish = function(){ d.open = expanded; d.removeAttribute('data-faq-closing'); animation = null; };
      });
      faqCleanups.push(function(){ if (animation) animation.cancel(); d.open = expanded; d.removeAttribute('data-faq-closing'); });
    }
    on(d, 'toggle', function(){ if (d.open) { var q = $('summary h3', d); push({ event: 'click_25plus8_faq', cta_position: 'faq', faq_question: q ? q.textContent.trim() : '' }); } });
  });
  return function(){
    disposed = true;
    faqCleanups.forEach(function(cleanup){ cleanup(); });
    clearInterval(timer);
    if (yp && yp.destroy) yp.destroy();
    if (player) player.replaceChildren();
    if (apiReady && window.onYouTubeIframeAPIReady === apiReady) window.onYouTubeIframeAPIReady = prevReady;
    listeners.forEach(function(args){ args[0].removeEventListener(args[1], args[2], args[3]); });
    observers.forEach(function(observer){ observer.disconnect(); });
    timers.forEach(clearTimeout);
    root.classList.remove('l-js');
    $$('[data-rv]').forEach(function(el){ el.removeAttribute('data-rv'); el.removeAttribute('data-in'); el.style.transitionDelay = ''; });
  };
}
