/* UNTO brand behaviours: fit-to-width display type, Christmas countdown,
   the eyes that look around, and the quantity tiles. No dependencies. */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Caslon Italian "as big as it can fit" */
  function fitAll() {
    document.querySelectorAll('.u-fit').forEach(function (el) {
      var box = el.parentElement;
      var styles = getComputedStyle(box);
      var available = box.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      if (!available) return;
      var max = parseFloat(el.dataset.max || 0);
      el.style.fontSize = '100px';
      var natural = el.scrollWidth;
      if (!natural) return;
      var size = (100 * available) / natural;
      if (max && size > max) size = max;
      el.style.fontSize = size.toFixed(2) + 'px';
    });
  }
  var lastWidth = 0;
  function onResize() {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    fitAll();
  }
  fitAll();
  lastWidth = window.innerWidth;
  window.addEventListener('resize', onResize);
  window.addEventListener('load', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  document.addEventListener('shopify:section:load', fitAll);

  /* "36 days left to order for Christmas" */
  function countdowns() {
    document.querySelectorAll('[data-unto-countdown]').forEach(function (el) {
      var parts = (el.dataset.untoCountdown || '').split('-').map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return;
      var end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
      var days = Math.ceil((end - new Date()) / 86400000);
      var short = el.hasAttribute('data-short');
      if (days > 1) el.textContent = days + (short ? ' days left.' : ' days left to order for Christmas');
      else if (days === 1) el.textContent = short ? 'Last day.' : 'Last day to order for Christmas';
      else el.textContent = el.dataset.after || '';
    });
  }
  countdowns();
  document.addEventListener('shopify:section:load', countdowns);

  /* The eyes follow the pointer on desktop and the scroll on phones */
  var eyes = document.querySelectorAll('[data-unto-eyes]');
  if (eyes.length && !reduceMotion) {
    var look = function (x, y) {
      eyes.forEach(function (wrap) {
        var pupils = wrap.querySelector('.u-def__pupils');
        if (!pupils) return;
        var r = wrap.getBoundingClientRect();
        var dx = (x - (r.left + r.width / 2)) / window.innerWidth;
        var dy = (y - (r.top + r.height / 2)) / window.innerHeight;
        dx = Math.max(-1, Math.min(1, dx * 2));
        dy = Math.max(-1, Math.min(1, dy * 2));
        pupils.style.transform = 'translate(' + (dx * 7).toFixed(2) + '%, ' + (dy * 9 - 6).toFixed(2) + '%)';
      });
    };
    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('pointermove', function (e) { look(e.clientX, e.clientY); }, { passive: true });
    } else {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          look(window.innerWidth * 0.5, window.innerHeight * 0.15);
        });
      }, { passive: true });
    }
  }

  /* Quantity tiles: "1 tin / 2 tins / 3 tins" drive the standard quantity input */
  document.addEventListener('change', function (e) {
    var input = e.target;
    if (!input.matches || !input.matches('.u-chip input')) return;
    var chips = input.closest('.u-chips');
    var qty = document.getElementById('Quantity-' + chips.dataset.section);
    if (qty) {
      qty.value = input.value;
      qty.dispatchEvent(new Event('change', { bubbles: true }));
    }
    var label = input.closest('.u-chip');
    document.querySelectorAll('[data-unto-total="' + chips.dataset.section + '"]').forEach(function (el) {
      el.textContent = label.dataset.total;
    });
  });
})();
