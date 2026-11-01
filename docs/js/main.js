(function () {
  'use strict';
  var T = {
    es: { nav_shots: 'Capturas', nav_host: 'Instalar',
      hero_lead: 'Un bot de Discord de código abierto con diversión, utilidad y bienvenidas personalizables. Listo para hostear tú mismo.',
      cta_github: 'Ver en GitHub', cta_shots: 'Ver capturas',
      hero_meta: 'discord.js v14 · Node.js · SQLite · Español, English y Português',
      shots_title: 'En Discord', shots_hint: 'Toca una captura para verla completa.',
      host_title: 'Instálalo en tu servidor',
      host_desc: 'Clona el repositorio, agrega tu token y ejecútalo. Sigue el README para los detalles.',
      host_cta: 'Abrir repositorio', copy: 'Copiar', copied: 'Copiado', foot: 'código abierto'
    },
    en: { nav_shots: 'Screenshots', nav_host: 'Install',
      hero_lead: 'An open-source Discord bot with fun, utility and customizable welcomes. Ready to self-host.',
      cta_github: 'View on GitHub', cta_shots: 'See screenshots',
      hero_meta: 'discord.js v14 · Node.js · SQLite · English, Español and Português',
      shots_title: 'On Discord', shots_hint: 'Tap a screenshot to view it full size.',
      host_title: 'Install it on your server',
      host_desc: 'Clone the repository, add your token and run it. Follow the README for details.',
      host_cta: 'Open repository', copy: 'Copy', copied: 'Copied', foot: 'open source'
    }
  };

  function setLang(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = T[lang][el.getAttribute('data-i18n')];
      if (v) el.textContent = v;
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    try { localStorage.setItem('akame-lang', lang); } catch (e) {}
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  var saved = null;
  try { saved = localStorage.getItem('akame-lang'); } catch (e) {}
  var lang = saved || ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es');
  if (lang !== 'es') setLang(lang);

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  items.forEach(function (el, i) { el.style.setProperty('--d', (el.classList.contains('thumb') ? (i % 3) * 0.08 : 0) + 's'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  // Visor de capturas
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.thumb'));
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  var cur = 0, opener = null;
  function show(i) {
    cur = (i + thumbs.length) % thumbs.length;
    lbImg.src = thumbs[cur].dataset.full;
    lbImg.alt = thumbs[cur].getAttribute('aria-label');
    lbCap.textContent = thumbs[cur].dataset.cap;
  }
  function open(i) { opener = thumbs[i]; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
  function close() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  thumbs.forEach(function (t, i) { t.addEventListener('click', function () { open(i); }); });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  // Copiar comandos
  var cb = document.getElementById('copyBtn');
  if (cb) cb.addEventListener('click', function () {
    var l = document.documentElement.lang === 'en' ? 'en' : 'es';
    var text = document.getElementById('cmds').textContent;
    var done = function () {
      cb.textContent = T[l].copied;
      setTimeout(function () { cb.textContent = T[l].copy; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
  });
})();
