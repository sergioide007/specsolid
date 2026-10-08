/* SpecSolid — selector de tema claro/oscuro
   Se carga en <head> SIN defer, para fijar el tema antes del primer pintado (evita el parpadeo). */
(function () {
  var KEY = 'specsolid-theme';
  var root = document.documentElement;
  var DEFAULT = 'system';            // 'system' | 'dark' | 'light'  → cámbialo a 'dark' para mantener el oscuro por defecto

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function systemTheme() { return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
  function initial() {
    var s = saved();
    if (s === 'light' || s === 'dark') return s;
    return DEFAULT === 'system' ? systemTheme() : DEFAULT;
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f6f8' : '#050a14');
    document.querySelectorAll('.ss-theme-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', theme === 'light');
      b.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    });
  }

  apply(initial());

  var ICONS =
    '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
    '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function toggle() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.classList.add('theme-switching');          // apaga transiciones un instante
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.remove('theme-switching'); });
    });
  }

  function makeButton() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ss-theme-btn';
    b.innerHTML = ICONS;
    b.addEventListener('click', toggle);
    return b;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var cta = document.querySelector('.nav-cta');
    if (cta) cta.insertBefore(makeButton(), cta.firstChild);

    // En móvil el .nav-cta suele ocultarse: también va dentro del menú ☰
    var mobile = document.getElementById('mobileMenu');
    if (mobile) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'padding:12px 0 4px';
      wrap.appendChild(makeButton());
      mobile.appendChild(wrap);
    }
    apply(root.getAttribute('data-theme'));         // sincroniza aria-label

    // Si la persona nunca eligió, seguir los cambios del sistema
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
      if (!saved() && DEFAULT === 'system') apply(systemTheme());
    });
  });
})();
